<template>
  <UDrawer
    :modal="false"
    v-model:open="drawerOpen"
    :direction="isDesktop ? 'left' : 'top'"
    class="shadow bottom-auto"
    :class="isDesktop && 'w-96'"
    inset
    :handle="false"
    handle-only
    :dismissible="false"
    :ui="{
      content: ['inset-x-2', isDesktop ? 'top-17' : 'top-2 z-10']
    }"
  >
    <template #title>
      <div class="flex flex-row items-center justify-between">
        <h2 class="flex flex-row items-center text-lg font-semibold gap-2">
          <Icon name="material-symbols:navigation" class="text-primary" />
          <span>経路検索</span>
        </h2>
        <UButton
          class="cursor-pointer"
          icon="material-symbols:close"
          color="neutral"
          variant="link"
          size="md"
          @click="drawerOpen = false"
          aria-label="Close route search drawer" />
      </div>
    </template>
    <template #body>
      <section class="flex flex-col gap-4 items-start" ref="drawerContent">
        <UFormField label="出発地" class="w-full">
          <PlaceInput v-model="placeFrom"/>
        </UFormField>
        <UFormField label="目的地" class="w-full">
          <PlaceInput v-model="placeTo"/>
        </UFormField>
        <UAlert
          v-if="searchError"
          title="経路の探索に失敗しました"
          description="地点の組み合わせを変えて再度お試しください"
          color="warning"
          variant="subtle"
          close
          @update:open="searchError = false"
        />
        <UFieldGroup class="w-full">
          <UButton
            block
            color="primary"
            class="cursor-pointer"
            @click="executeRouteSearch"
            :label="useWeight ? '最適経路を検索' : '最短経路を検索'"
            :disabled="!placeFrom || !placeTo"
          />
          <UDropdownMenu
            :ui="{
              content: 'z-50'
            }"
            :items="[{
              label: '最短経路を検索',
              onSelect: () => { useWeight = false; executeRouteSearch(); },
            }, {
              label: '最適経路を検索',
              onSelect: () => { useWeight = true; executeRouteSearch(); },
            }]"
            :disabled="!placeFrom || !placeTo"
          >
            <UButton icon="material-symbols:keyboard-arrow-down" class="cursor-pointer" />
          </UDropdownMenu>
        </UFieldGroup>
      </section>
    </template>
    <template #footer v-if="distance && duration">
      <span class="text-sm text-muted-foreground">
        {{ distance !== null ? `おおよその距離: ${distance} m` : "" }}
        {{ duration !== null ? ` / 所要時間: ${duration} 分` : "" }}
      </span>
    </template>
  </UDrawer>
</template>

<script setup lang="ts">
import type { PlaceInputValue } from "./PlaceInput.vue";
import { bbox, length } from "@turf/turf";

const {
  map,
  padding,
  pathFindTo,
  pathFindResult,
} = useMapState();

const isDesktop = useDesktopQuery();
const searchError = ref(false);
const drawerOpen = ref(false);
const drawerContent = useTemplateRef<HTMLElement>("drawerContent");

watch(
  () => pathFindTo.value,
  (newVal) => {
    if (newVal === null) return;
    placeTo.value = newVal;
    drawerOpen.value = true;
  },
);

watch(drawerOpen, (newVal) => {
  if (!newVal) {
    pathFindTo.value = null;
    pathFindResult.value = null;
    placeFrom.value = undefined;
    placeTo.value = undefined;
  }
});

const useWeight = ref(true);
const placeFrom = ref<PlaceInputValue>();
const placeTo = ref<PlaceInputValue>();
const distance = computed(() => {
  if(!pathFindResult.value) return null;
  return Math.ceil(length(pathFindResult.value, { units: 'meters' }) / 10) * 10;
});
const duration = computed(() => {
  if(!distance.value) return null;
  const areas = new Set([placeFrom.value?.value.properties.area, placeTo.value?.value.properties.area]);
  let additionalTime = 0;
  if(areas.has('east') && areas.has('west')) {
    additionalTime += 1;
  }
  if(areas.has("west") && areas.has("100th")) {
    additionalTime += 2;
  }
  if(areas.has("east") && areas.has("100th")) {
    additionalTime += 3;
  }
  // 80m/min
  return Math.ceil(distance.value / 80) + additionalTime;
});

const executeRouteSearch = () => {
  if (!placeFrom.value || !placeTo.value) return;
  if(placeFrom.value.value.id === placeTo.value.value.id) {
    searchError.value = true;
    return;
  }
  const startSnaps: SnapResult[] = placeFrom.value.value.type === "building" ? getBuildingEntrances(placeFrom.value.value.id) : [];
  if (startSnaps.length === 0) {
    const s = findNearestNetworkPoint(placeFrom.value.value.coordinates);
    if (s) startSnaps.push(s);
  }
  if (startSnaps.length === 0) {
    searchError.value = true;
    return;
  }

  const endSnaps: SnapResult[] = placeTo.value.value.type === "building" ? getBuildingEntrances(placeTo.value.value.id) : [];
  if (endSnaps.length === 0) {
    console.log(placeTo.value.value)
    const s = findNearestNetworkPoint(placeTo.value.value.coordinates);
    if (s) endSnaps.push(s);
  }
  if (endSnaps.length === 0) {
    searchError.value = true;
    return;
  }

  const routeGeoJSON = calculateRoute(startSnaps, endSnaps, useWeight.value);

  if (routeGeoJSON) {
    searchError.value = false;
    pathFindResult.value = routeGeoJSON;
    const _bbox = bbox(routeGeoJSON);

    // ドロワー要素のサイズを取得してpadding計算
    nextTick(() => {
      const drawerHeight = drawerContent.value?.getBoundingClientRect().height ?? (isDesktop.value ? 50 : 300);

      map.value?.fitBounds(
        [
          [_bbox[0], _bbox[1]],
          [_bbox[2], _bbox[3]],
        ],
        {
          bearing: map.value?.getBearing?.() ?? 0,
          padding: {
            top: isDesktop.value ? 50 : (drawerHeight + 100),
            bottom: isDesktop.value ? 50 : 50,
            left: isDesktop.value ? 100 : 50,
            right: isDesktop.value ? 100 : 50,
          },
        },
      );
    });
  } else {
    searchError.value = true;
  }
};
</script>
