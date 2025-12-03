<template>
  <MglMap :map-style="style" :center="center" :zoom="zoom" :max-zoom="22" :bearing="20" interactive>
    <MglNavigationControl/>
    <MglCustomControl>
      <button @click="floor = Math.min(floor + 1, 4)">▲</button>
      </MglCustomControl>
    <MglCustomControl>
      <button>{{ floor }}F</button>
    </MglCustomControl>
    <MglCustomControl>
      <button @click="floor = Math.max(floor - 1, 1)">▼</button>
    </MglCustomControl>
    <MglCustomControl>
      <select v-model="language">
        <option value="ja">日本語</option>
        <option value="en">English</option>
      </select>
    </MglCustomControl>
    <MglGeolocateControl
      :position-options="{ enableHighAccuracy: true }"
      :track-user-location="true"
    />
    <!-- <MglMarker
      :coordinates="center"
    >
      <template #marker>
        <LocationIcon style="width: 32px; height: 32px; color: red;" />
      </template>
    </MglMarker> -->
  </MglMap>
</template>

<script setup lang="ts">
import { setupTiles } from "@e-chan1007/uec-map-sdk";
import { useMap } from "@indoorequal/vue-maplibre-gl";
import maplibregl from 'maplibre-gl';
import "maplibre-gl/dist/maplibre-gl.css";
import LocationIcon from "~icons/material-symbols/location-on";

import EntrancesGeoJSON from "@/assets/entrances.json";
import PathsGeoJSON from "@/assets/paths.json";

initPathFinding(
  PathsGeoJSON as GeoJSON.FeatureCollection<GeoJSON.LineString>,
  EntrancesGeoJSON as GeoJSON.FeatureCollection<GeoJSON.Point>,
);

setupTiles(maplibregl);

const center = [139.5425, 35.6570] as [number, number];
const zoom = 15;

const floor = ref(1);

const mapInstance = useMap();
const shouldUseExtrusion = ref(false);
const language = ref("ja");
const startSnap = ref<SnapResult | null>(null);

watch(() => mapInstance.isLoaded, async (isLoaded) => {
  if(!isLoaded || !mapInstance.map) return;
  const map = mapInstance.map;
  await loadMapIcons(map);

  map.on("pitch", (e) => {
    const _shouldUseExtrusion = e.target.getPitch() > 30;
    if(shouldUseExtrusion.value !== _shouldUseExtrusion) {
      shouldUseExtrusion.value = _shouldUseExtrusion;
    }
  })

  map.on('click', (e) => {
  const clickCoords: [number, number] = [e.lngLat.lng, e.lngLat.lat];

  // 1. クリックしたのが「建物」かどうか判定
  const [feature] = map.queryRenderedFeatures(e.point, { layers: ['buildings'] });

  let targetSnaps: SnapResult[] = [];

  if (feature) {
    // 建物の場合: IDを取得して入口を探す
    const buildingId = feature.properties?.['id'];
    if (buildingId) {
      targetSnaps = getBuildingEntrances(buildingId);
      console.log(`Building clicked: ${buildingId}, Entrances: ${targetSnaps.length}`);
    }

    // 入口が見つからない、またはIDがない場合は、クリック位置から最寄りの道路へ
    if (targetSnaps.length === 0) {
      const s = findNearestNetworkPoint(clickCoords);
      if (s) targetSnaps = [s];
    }
  } else {
    // 道路/地面の場合: クリック位置から最寄りの道路へスナップ
    const s = findNearestNetworkPoint(clickCoords);
    if (s) targetSnaps = [s];
  }

  // 近くに道路がない場合
  if (targetSnaps.length === 0) {
    console.warn('No road nearby.');
    return;
  }

  // 2. スタート・ゴールの状態遷移
  if (!startSnap.value) {
    // --- 1回目のクリック: スタート設定 ---
    startSnap.value = targetSnaps[0] ?? null; // スタート地点は常に1つと仮定（現在地など）

    // (UI: ここでスタート地点にマーカーを立てると親切)
    console.log('Start set:', startSnap);
    alert('スタート地点を設定しました。ゴールとなる建物をクリックしてください。');

  } else {
    // --- 2回目のクリック: ゴール設定 & 計算 ---
    const endSnaps = targetSnaps; // 建物なら複数の入口候補が入る

    // 経路計算
    console.time('CalcRoute');
    const routeGeoJSON = calculateRoute(startSnap.value, endSnaps, false);
    console.timeEnd('CalcRoute');

    if (routeGeoJSON) {
      // 地図に描画
      const source = map.getSource('pathFindResult') as maplibregl.GeoJSONSource;
      source.setData(routeGeoJSON);
      console.log(routeGeoJSON)
      console.log('Route found!', routeGeoJSON.properties?.distance + 'm');
    } else {
      alert('経路が見つかりませんでした（エリアが接続されていない可能性があります）');
    }

    startSnap.value = null;
  }
});

// カーソルの変更 (建物の上に来たらポインタにする)
map.on('mouseenter', 'buildings', () => {
  map.getCanvas().style.cursor = 'pointer';
});
map.on('mouseleave', 'buildings', () => {
  map.getCanvas().style.cursor = '';
});
});

const style = useMapStyle(floor, shouldUseExtrusion, language);

onMounted(() => {
})

</script>
