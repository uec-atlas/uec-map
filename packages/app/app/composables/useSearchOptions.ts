import type { CommandPaletteGroup } from "@nuxt/ui";
import { centroid, polygonToLine } from "@turf/turf";
import type { Polygon } from "geojson";

const typeOrder = {
  academic: 0,
  office: 1,
  community: 2,
  residential: 3,
  utility: 4,
};

export const useSearchOptions = () => {
  const searchOptions = computed(() => {
    const { typeMap } = useSpatialEntries();
    const {
      Building: buildings,
      Facility: facilities,
      Room: floors,
      Gate: gates,
    } = typeMap.value;
    return [
      {
        id: "buildings",
        label: "建物",
        items: buildings
          .filter((building) => building.geometry)
          .map((building) => ({
            id: building.properties.id as string,
            label: getNameOfSpatialEntity(building),
            suffix: getAltNameOfSpatialEntity(building),
            icon: "material-symbols:domain",
            value: {
              type: "building",
              id: building.properties.id as string,
              properties: building.properties,
              coordinate: centroid(polygonToLine(building.geometry as Polygon))
                .geometry.coordinates,
              geometry: building.geometry,
            },
          }))
          .filter(({ label }) => label && label.trim() !== "")
          .toSorted((a, b) => {
            const typeA =
              typeOrder[a.value.properties.type as keyof typeof typeOrder] ??
              999;
            const typeB =
              typeOrder[b.value.properties.type as keyof typeof typeOrder] ??
              999;
            if (typeA !== typeB) return typeA - typeB;

            if (a.value.properties.category === "academic") {
              const orderA = /^(新)?[A-D]棟$/.test(a.label)
                ? 0
                : /^東/.test(a.label)
                  ? 1
                  : /^西/.test(a.label)
                    ? 2
                    : 3;
              const orderB = /^(新)?[A-D]棟$/.test(b.label)
                ? 0
                : /^東/.test(b.label)
                  ? 1
                  : /^西/.test(b.label)
                    ? 2
                    : 3;
              if (orderA !== orderB) return orderA - orderB;

              if (orderA === 0) {
                return (
                  a.label
                    .replace("新", "")
                    .localeCompare(b.label.replace("新", ""), "ja") ||
                  a.label.localeCompare(b.label, "ja")
                );
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
          label: getNameOfSpatialEntity(gate),
          suffix:
            gate.properties.name.ja === "中門"
              ? gate.properties.containedInPlace === "uar:spatial/EFIV3IVM"
                ? "東地区"
                : "西地区"
              : undefined,
          icon: "material-symbols:gate",
          value: {
            type: "gate",
            id: gate.properties.id as string,
            properties: gate.properties,
            coordinate: (gate.geometry as GeoJSON.Point).coordinates,
          },
        })),
      },
      {
        id: "rooms",
        label: "講義室・施設",
        items: floors.flatMap((room, index) => {
          if (!room.geometry) return [];

          const name = getNameOfSpatialEntity(room);
          if (!name || name.trim() === "") return [];
          if (
            ![
              "Classroom",
              "PracticeRoom",
              "Facility",
              "Room",
              "RoomSubZone",
            ].includes(room.properties.type)
          )
            return [];
          const building = buildings.find(
            (b) => room.properties.ancestors.includes(b.id as string) ?? false,
          );
          const parentFacility = facilities.find(
            (f) => room.properties.isPartOf?.includes(f.id as string) ?? false,
          );
          const parent = parentFacility || building;
          if (!parent) return [];

          return {
            id: `${index}`,
            label: name,
            suffix: getAltNameOfSpatialEntity(room)
              ? `${getAltNameOfSpatialEntity(room)}（${getNameOfSpatialEntity(parent)}）`
              : getNameOfSpatialEntity(parent),
            searchKey:
              `${getNameOfSpatialEntity(building)} ${getAltNameOfSpatialEntity(building)} ${getNameOfSpatialEntity(parentFacility)} ${getAltNameOfSpatialEntity(parentFacility)} ${name} ${getAltNameOfSpatialEntity(room)}`.trim(),
            icon: MAP_ICONS["material-symbols:co-present"],
            value: {
              type: "room",
              id: `${index}`,
              properties: room.properties,
              building: {
                id: building?.properties.id as string,
                properties: building?.properties,
              },
              coordinate: centroid(polygonToLine(room.geometry as Polygon))
                .geometry.coordinates,
              geometry: room.geometry,
            },
          };
        }),
      },
    ] as const satisfies CommandPaletteGroup[];
  });

  const selectOptions = computed(() =>
    [searchOptions.value[0], searchOptions.value[1]].flatMap((group) =>
      group.items.map((item) => ({
        ...item,
        label:
          "suffix" in item && item.suffix
            ? `${item.label} (${item.suffix})`
            : item.label,
      })),
    ),
  );

  return {
    searchOptions,
    selectOptions,
    fuseOptions: {
      keys: ["searchKey"],
      threshold: 0.2,
    },
  };
};
