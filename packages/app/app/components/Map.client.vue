<template>
  <MglMap :map-style="style" :center="center" :zoom="zoom" :max-zoom="22">
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
  </MglMap>
</template>

<script setup lang="ts">
import { setupTiles } from "@e-chan1007/uec-map-sdk";
import { useMap } from "@indoorequal/vue-maplibre-gl";
import maplibregl from 'maplibre-gl';
import "maplibre-gl/dist/maplibre-gl.css";

setupTiles(maplibregl);

const center = [139.544333, 35.655601] as [number, number];
const zoom = 16;

const floor = ref(1);

const mapInstance = useMap();
const shouldUseExtrusion = ref(false);
const language = ref("ja");

watch(() => mapInstance.isLoaded, async (isLoaded) => {
  if(!isLoaded || !mapInstance.map) return;
  await loadMapIcons(mapInstance.map);

  mapInstance.map.on("pitch", (e) => {
    const _shouldUseExtrusion = e.target.getPitch() > 30;
    if(shouldUseExtrusion.value !== _shouldUseExtrusion) {
      shouldUseExtrusion.value = _shouldUseExtrusion;
    }
  })
});

const style = useMapStyle(floor, shouldUseExtrusion, language);
</script>
