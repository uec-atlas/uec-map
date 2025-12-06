import buildingsGeoJSON from "@/assets/buildings.json";
import gatesGeoJSON from "@/assets/gates.json";
import type { CommandPaletteGroup } from "@nuxt/ui";
import { centroid, polygonToLine } from "@turf/turf";
import type { Polygon } from "geojson";

const buildings = buildingsGeoJSON.features;
const gates = gatesGeoJSON.features;

const typeOrder = { academic: 0, office: 1, community: 2, residential: 3, utility: 4 };

const searchOptions = [
  {
    id: "buildings",
    label: "建物",
    items: buildings.map((building) => ({
      id: building.properties.id as string,
      label: building.properties.name as string,
      suffix: building.properties.altname as string | undefined,
      icon: "material-symbols:domain",
      value: {
        type: "building",
        id: building.properties.id as string,
        properties: building.properties,
        coordinates: centroid(polygonToLine(building.geometry as unknown as Polygon))
          .geometry.coordinates,
      },
    }))
    .filter(({ label }) => label && label.trim() !== "")
    .filter(({ value }) => value.properties.area)
    .toSorted((a, b) => {
      const typeA = typeOrder[a.value.properties.type as keyof typeof typeOrder] ?? 999;
      const typeB = typeOrder[b.value.properties.type as keyof typeof typeOrder] ?? 999;
      if (typeA !== typeB) return typeA - typeB;

      if (a.value.properties.type === "academic") {
        const orderA = /^(新)?[A-D]棟$/.test(a.label) ? 0 : /^東/.test(a.label) ? 1 : /^西/.test(a.label) ? 2 : 3;
        const orderB = /^(新)?[A-D]棟$/.test(b.label) ? 0 : /^東/.test(b.label) ? 1 : /^西/.test(b.label) ? 2 : 3;
        if (orderA !== orderB) return orderA - orderB;

        if (orderA === 0) {
          return a.label.replace("新", "").localeCompare(b.label.replace("新", ""), "ja")
            || a.label.localeCompare(b.label, "ja");
        }
      }

      return a.label.localeCompare(b.label, "ja", { numeric: true });
    }),
  },
  {
    id: "gates",
    label: "門",
    items: gates.map((gate) => ({
      id: gate.properties.id as string,
      label: gate.properties.name as string,
      suffix: gate.properties.name === "中門" ? (gate.properties.area === "east" ? "東地区" : "西地区") : undefined,
      icon: "material-symbols:gate",
      value: {
        type: "gate",
        id: gate.properties.id as string,
        properties: gate.properties,
        coordinates: gate.geometry.coordinates as [number, number],
      },
    })),
  },
] as const satisfies CommandPaletteGroup[];

const selectOptions = searchOptions.flatMap(group => group.items.map(item => ({
  ...item,
  label: 'suffix' in item && item.suffix ? `${item.label} (${item.suffix})` : item.label,
})));

export const useSearchOptions = () => {
  return {
    searchOptions,
    selectOptions,
    fuseOptions: {
      keys: ['value.properties.name', 'value.properties.altname', 'value.properties.name:en', 'value.properties.altname:en'],
    }
  }
}
