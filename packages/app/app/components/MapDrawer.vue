<template>
  <UDrawer
    :modal="false"
    v-model:open="drawerOpen"
    :direction="isDesktop ? 'right' : 'bottom'"
    class="shadow"
    :handle="!isDesktop"
    handle-only
    :inset="isDesktop"
    :class="isDesktop && 'right-2 top-17 w-80 bottom-auto'"
  >
    <template #body>
      <section class="flex flex-col gap-6 items-start" ref="drawerContainer">
        <header class="flex flex-row items-stretch gap-4">
          <div
            class="rounded-full w-2"
            :style="{ backgroundColor: areaColor }"
          />
          <div class="flex flex-col gap-2 py-4">
            <span class="text-sm text-muted-foreground" v-if="selectedObject">
              {{ areaLabel }}
              {{ building && getNameOfSpatialEntity(building) }}
              {{ selectedObject.type === "Room"
                ? getFloorForFeature(selectedObject)?.labelWithSuffix
                : "" }}
            </span>
            <h2 class="text-xl font-semibold">
              {{  getNameOfSpatialEntity(selectedObject!, "名称未設定の地点") }}
            </h2>
            <span
              class="text-sm text-muted-foreground"
              v-if="getAltNameOfSpatialEntity(selectedObject!)"
              >{{ getAltNameOfSpatialEntity(selectedObject!) }}</span
            >
            <span
              class="text-sm text-muted-foreground"
              v-if="parentFacility"
              >{{ getNameOfSpatialEntity(parentFacility) }}</span
            >
          </div>
        </header>
        <div class="max-h-[50dvh] overflow-y-auto w-full">
          <MapDrawerOpeningHours
            v-if="openingSpec"
            :spec="openingSpec"
          />
          <MapDrawerClassroomDetails
            v-if="selectedObject?.type === 'Room' && selectedObject.properties?.type === 'Classroom'"
            :properties="(selectedObject.properties as {
              maximumAttendeeCapacity: number;
              maximumExamAttendeeCapacity: number;
              seatType: 'fixed' | 'movable';
            })"
          />
        </div>
      </section>
    </template>
    <template #footer>
      <UButton
          block
          class="cursor-pointer"
          icon="material-symbols:navigation"
          @click="executeRouteSearch"
        >
          経路を調べる
        </UButton>
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
const { idMap, typeMap, getAreaKeyForFeature, getFloorForFeature } = useSpatialEntries();
const drawerContainer = useTemplateRef<HTMLElement>("drawerContainer");
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

const parentFacility = computed(() => {
  if (!selectedObject.value) return null;

  const parents = [
    selectedObject.value.properties.containedInPlace,
    ...selectedObject.value.properties.isPartOf || [],
  ].filter((id): id is string => !!id);
  for(const parentId of parents) {
    const parentFeature = idMap.value.get(parentId);
    if (parentFeature && parentFeature.properties?.type === "Facility") {
      return parentFeature;
    }
  }
  return null;
});

const openingSpec = computed(() => {
  if (!selectedObject.value) return null;
  return selectedObject.value.properties.openingHoursSpecification || parentFacility.value?.properties?.openingHoursSpecification || null;
});

watch(
  () => _selectedObject.value,
  (newVal) => {
    if (newVal === null) return;
    selectedObject.value = newVal;
    unescapeProperties(selectedObject.value);
    if(selectedObject.value.type === "Room") {
      unescapeProperties(selectedObject.value.building);
    }
  },
);

const executeRouteSearch = () => {
  if (!selectedObject.value) return;
  if (selectedObject.value.type === "Room") {
    _externalFrom.value = {
      id: selectedObject.value.building.properties.id,
      label: getNameOfSpatialEntity(selectedObject.value.building),
      value: selectedObject.value.building,
    } as unknown as PlaceInputValue;
  } else {
    _externalFrom.value = {
      id: selectedObject.value.properties.id,
      label: getNameOfSpatialEntity(selectedObject.value),
      value: selectedObject.value,
    } as unknown as PlaceInputValue;
  }
  drawerOpen.value = false;
};

const building = computed(() => {
  if (selectedObject.value?.type !== "Room") return null;
  return selectedObject.value.building;
});

const area = computed(() =>
  getAreaKeyForFeature(selectedObject.value)
);

const areaLabel = computed(() => {
  for(const areaFeature of [...typeMap.value.Area, ...typeMap.value.Site]) {
    if (selectedObject.value?.properties.ancestors.includes(areaFeature.properties.id)) {
      return getNameOfSpatialEntity(areaFeature);
    }
  }
  return "不明な場所";
});

const mode = useColorMode();
const areaColor = computed(() => {
  return mode.value === "dark"
    ? (area.value ? DARK_BUILDING_AREA_COLOR[AREA_ID_MAP[area.value]] : "#aaaaaa")
    : (area.value ? BUILDING_AREA_COLOR[AREA_ID_MAP[area.value]] : "#222222");
});

watch(
  () => [drawerOpen.value, isDesktop.value],
  () => {
    if (drawerOpen.value) {
      nextTick(() => {
        const height =
          drawerContainer.value?.getBoundingClientRect().height ??
          window.innerHeight / 2;
        padding.value.bottom = isDesktop.value ? 0 : height;
      });
    } else {
      padding.value.bottom = 0;
    }
  },
);
</script>
