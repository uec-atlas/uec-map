<template>
  <UDrawer
    :modal="false"
    v-model:open="drawerOpen"
    :direction="isDesktop ? 'right' : 'bottom'"
    :class="isDesktop ? 'w-80' : 'h-1/2'"
  >
    <template #body>
      <section class="flex flex-col gap-6 items-start">
        <header class="flex flex-row items-stretch gap-4">
          <div
            class="rounded-full w-2"
            :style="{ backgroundColor: areaColor }"
          />
          <div class="flex flex-col gap-2 py-4">
            <span class="text-sm text-muted-foreground">
              {{ areaLabel }}
              {{ building?.properties.name || "" }}
            </span>
            <h2 class="text-xl font-semibold">
              {{ selectedObject?.properties.name || "名称未設定の地点" }}
            </h2>
            <span
              class="text-sm text-muted-foreground"
              v-if="selectedObject?.properties.altname"
              >{{ selectedObject?.properties.altname }}</span
            >
          </div>
        </header>
        <UButton class="cursor-pointer" icon="material-symbols:alt-route" @click="executeRouteSearch">
          経路を調べる
        </UButton>
        <PlaceInput v-model="searchTarget" />
      </section>
    </template>
  </UDrawer>
</template>

<script setup lang="ts">
import {
  BUILDING_AREA_COLOR,
  DARK_BUILDING_AREA_COLOR,
} from "~/map-style/theme/colors";
import type { PlaceInputValue } from "./PlaceInput.vue";

const { selectedObject, padding, pathFindResult } = useMapState();
const isDesktop = useMediaQuery("(min-width: 768px)");
const drawerOpen = computed({
  get: () => selectedObject.value !== null,
  set: (val: boolean) => {
    if (!val) {
      selectedObject.value = null;
    }
  },
});

const searchTarget = ref<PlaceInputValue>();
const executeRouteSearch = () => {
  if (!searchTarget.value || !selectedObject.value) return;
  const startSnaps: SnapResult[] = [];
  if(selectedObject.value.type === "room") {
    const s = getBuildingEntrances(selectedObject.value.building.id);
    if (s) startSnaps.push(...s);
  } else {
    const s = getBuildingEntrances(selectedObject.value.id);
    startSnaps.push(...s);
  }
  if(startSnaps.length === 0) {
    const s = findNearestNetworkPoint(selectedObject.value.coordinates);
    if (s) startSnaps.push(s);
  }
  if (startSnaps.length === 0) {
    console.warn('No road nearby for start point.');
    return;
  }

  let endSnaps: SnapResult[] = [];

  const buildingId = searchTarget.value.id;
  endSnaps = getBuildingEntrances(buildingId);
  console.log(`Building clicked: ${buildingId}, Entrances: ${endSnaps.length}`);

  if (endSnaps.length === 0) {
    const s = findNearestNetworkPoint(searchTarget.value.value.coordinates);
    if (s) endSnaps = [s];
  }

  if (endSnaps.length === 0) {
    console.warn('No road nearby.');
    return;
  }

  const routeGeoJSON = calculateRoute(startSnaps, endSnaps, false);

  if (routeGeoJSON) {
    // 地図に描画
    pathFindResult.value = routeGeoJSON;
    console.log(routeGeoJSON)
    console.log('Route found!', routeGeoJSON.properties?.distance + 'm');
  } else {
    alert('経路が見つかりませんでした（エリアが接続されていない可能性があります）');
  }
};

const building = computed(() => {
  if (selectedObject.value?.type !== "room") return null;
  return selectedObject.value.building;
});

const area = computed(() => {
  if (!selectedObject.value) return "";
  return (
    (selectedObject.value.properties.area as string) ||
    (building.value?.properties.area as string) ||
    "unknown"
  );
});

const areaLabel = computed(() => {
  switch (area.value) {
    case "east":
      return "東地区";
    case "west":
      return "西地区";
    case "100th":
      return "100周年記念キャンパス";
    default:
      return "不明な地区";
  }
});

const mode = useColorMode();
const areaColor = computed(() => {
  return mode.value === "dark"
    ? (DARK_BUILDING_AREA_COLOR[area.value] ?? "#aaaaaa")
    : (BUILDING_AREA_COLOR[area.value] ?? "#222222");
});

watch(
  () => [drawerOpen.value, isDesktop.value],
  () => {
    if (drawerOpen.value && isDesktop.value) {
      padding.value.right = 320;
      padding.value.bottom = 0;
    } else {
      padding.value.right = 0;
      padding.value.bottom = isDesktop.value ? 0 : window.innerHeight / 2;
    }
  },
);
</script>
