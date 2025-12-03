<template>
  <div class="absolute top-0 left-0 w-full h-fit-content p-2 z-50">
    <UCommandPalette
      class="bg-default rounded-lg ring ring-accented"
      v-model="value"
      v-model:search-term="searchTerm"
      :groups="groups"
      placeholder="検索"
      close
      :fuse="{
        fuseOptions: {
          keys: ['value.properties.name', 'value.properties.altname', 'value.properties.name:en', 'value.properties.altname:en'],
        },
        matchAllWhenSearchEmpty: false
      }"
      :ui="{ empty: 'p-0' }"
      @update:open="searchTerm = ''"
    >
      <template #empty>
        <span/>
      </template>
    </UCommandPalette>
  </div>
</template>

<script lang="ts" setup>
import buildingsGeoJSON from "@/assets/buildings.json";
import gatesGeoJSON from "@/assets/gates.json";
import type { CommandPaletteGroup, CommandPaletteItem } from "@nuxt/ui";
import { center, polygonToLine } from "@turf/turf";
import type { Polygon } from "geojson";

const buildings = buildingsGeoJSON.features;
const gates = gatesGeoJSON.features;

const value = ref<CommandPaletteItem | null>(null);
const searchTerm = ref("");

watch(value, (newValue) => {
  if (!newValue) return;
  const mapState = useMapState();
  mapState.selectedObject.value = newValue.value;
  value.value = null;
  searchTerm.value = "";
});

const groups: CommandPaletteGroup[] = [
  {
    id: "buildings",
    label: "建物",
    items: buildings.map((building) => ({
      id: building.properties.id as string,
      label: building.properties.name as string,
      suffix: building.properties.altname as string | undefined,
      icon: "building",
      value: {
        type: "building",
        id: building.properties.id as string,
        properties: building.properties,
        coordinates: center(polygonToLine(building.geometry as Polygon))
          .geometry.coordinates,
      },
    })),
  },
  {
    id: "gates",
    label: "門",
    items: gates.map((gate) => ({
      id: gate.properties.id as string,
      label: gate.properties.name as string,
      icon: "gate",
      value: {
        type: "gate",
        id: gate.properties.id as string,
        properties: gate.properties,
        coordinates: gate.geometry.coordinates as [number, number],
      },
    })),
  },
];
</script>
