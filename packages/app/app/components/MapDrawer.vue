<template>
  <UDrawer
    :modal="false"
    v-model:open="drawerOpen"
    :direction="isDesktop ? 'right' : 'bottom'"
    class="shadow"
    :handle="false"
    handle-only
    :inset="isDesktop"
    :class="isDesktop && 'right-2 top-17 w-80 bottom-auto'"
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
        <UButton
          block
          class="cursor-pointer"
          icon="material-symbols:navigation"
          @click="executeRouteSearch"
        >
          経路を調べる
        </UButton>
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

const {
  selectedObject: _selectedObject,
  pathFindTo: _externalFrom,
  padding,
} = useMapState();
const isDesktop = useDesktopQuery();
const selectedObject = ref(_selectedObject.value);
const drawerOpen = computed({
  get: () => _selectedObject.value !== null,
  set: (val: boolean) => {
    if (!val) {
      _selectedObject.value = null;
    }
  },
});

watch(
  () => _selectedObject.value,
  (newVal) => {
    if (newVal === null) return;
    selectedObject.value = newVal;
  },
);

const executeRouteSearch = () => {
  if (!selectedObject.value) return;
  if(selectedObject.value.type === "room") {
    _externalFrom.value = {
      id: selectedObject.value.building.properties.id,
      label: selectedObject.value.building.properties.name,
      value: selectedObject.value.building,
    } as PlaceInputValue;
  } else {
    _externalFrom.value = {
      id: selectedObject.value.properties.id,
      label: selectedObject.value.properties.name,
      value: selectedObject.value,
    } as unknown as PlaceInputValue;
  }
  drawerOpen.value = false;
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
      padding.value.bottom = 0;
    } else {
      padding.value.bottom = isDesktop.value ? 0 : window.innerHeight / 2;
    }
  },
);
</script>
