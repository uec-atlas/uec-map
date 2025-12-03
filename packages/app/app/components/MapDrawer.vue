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
        <UButton class="cursor-pointer" icon="material-symbols:alt-route">
          経路を調べる
        </UButton>
      </section>
    </template>
  </UDrawer>
</template>

<script setup lang="ts">
import { build } from "nuxt";
import {
  BUILDING_AREA_COLOR,
  DARK_BUILDING_AREA_COLOR,
} from "~/map-style/theme/colors";

const { selectedObject, padding } = useMapState();
const isDesktop = useMediaQuery("(min-width: 768px)");
const drawerOpen = computed({
  get: () => selectedObject.value !== null,
  set: (val: boolean) => {
    if (!val) {
      selectedObject.value = null;
    }
  },
});

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
