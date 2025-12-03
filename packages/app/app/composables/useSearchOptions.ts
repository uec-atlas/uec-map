import buildingsGeoJSON from "@/assets/buildings.json";
import gatesGeoJSON from "@/assets/gates.json";
import type { CommandPaletteGroup } from "@nuxt/ui";
import { center, polygonToLine } from "@turf/turf";
import type { Polygon } from "geojson";

const buildings = buildingsGeoJSON.features;
const gates = gatesGeoJSON.features;

const searchOptions = [
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
    })).filter(({ label }) => label && label.trim() !== "")
    .toSorted((a, b) => a.label.localeCompare(b.label, "ja", { numeric: true })),
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
] as const satisfies CommandPaletteGroup[];

export const useSearchOptions = () => {
  return {
    searchOptions,
    fuseOptions: {
      keys: ['value.properties.name', 'value.properties.altname', 'value.properties.name:en', 'value.properties.altname:en'],
    }
  }
}
