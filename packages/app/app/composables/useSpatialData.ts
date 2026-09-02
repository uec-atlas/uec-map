import type { Feature } from "geojson";

export const SPATIAL_CLASSES = {
  SpatialEntity: ["Site", "Area", "BuildingEntrance", "Storey", "Structure"],
  Structure: [
    "Road",
    "Gate",
    "Building",
    "Bridge",
    "Passage",
    "Facility",
    "Room",
  ],
  Room: [
    "Classroom",
    "PracticeRoom",
    "ResearchLaboratory",
    "Restroom",
    "RoomSubZone",
  ],
} as const satisfies Record<string, string[]>;

const SPATIAL_CLASSES_REV = Object.entries(SPATIAL_CLASSES).reduce(
  (acc, [parent, children]) => {
    for (const child of children) {
      acc[child] = parent;
    }
    return acc;
  },
  {} as Record<string, string>,
);

type SpatialEntityType =
  | keyof typeof SPATIAL_CLASSES
  | (typeof SPATIAL_CLASSES)[keyof typeof SPATIAL_CLASSES][number];

interface SpatialProperty {
  // biome-ignore lint/suspicious/noExplicitAny: 推論できない
  [key: string]: any;
  type: SpatialEntityType;
  id: string;
  name: { en: string; ja: string };
  alternateName?: { en: string[]; ja: string[] };
  ancestors: string[];
  intersectsPlace?: string[];
  isPartOf?: string;
  containedInPlace?: string;
}

export const useSpatialEntries = () => {
  const { data } = useFetch("/api/map", {
    server: false,
    lazy: true,
    deep: false,
  });
  const geojson = computed(() => data.value?.geojson ?? null);
  const buildingCentroids = computed(() => data.value?.buildingCentroids ?? []);
  const floorCentroids = computed(() => data.value?.floorCentroids ?? []);
  const paths = computed(() => data.value?.paths ?? null);

  const idMap = computed(() => {
    const map = new Map<string, Feature>();
    if (!geojson.value) return map;
    for (const feature of geojson.value.features) {
      if (feature.id) map.set(String(feature.id), feature);
    }
    return map;
  });

  const typeMap = computed(() => {
    if (!geojson.value)
      return Object.fromEntries(
        Object.entries(SPATIAL_CLASSES).flatMap(([_parent, children]) =>
          children.map((child) => [
            child,
            [] as Feature<GeoJSON.Geometry, SpatialProperty>[],
          ]),
        ),
      ) as Record<
        SpatialEntityType,
        Feature<GeoJSON.Geometry, SpatialProperty>[]
      >;

    const map = new Map<SpatialEntityType, Set<Feature>>();
    for (const type of Object.entries(SPATIAL_CLASSES).flat().flat()) {
      map.set(type as SpatialEntityType, new Set());
    }

    for (const feature of geojson.value.features) {
      if (!feature.properties) continue;
      const typeQueue = [(feature.properties as { type: string }).type];
      while (typeQueue.length > 0) {
        const currentType = typeQueue.pop() as keyof typeof SPATIAL_CLASSES;
        map.get(currentType)?.add(feature);
        if (SPATIAL_CLASSES_REV[currentType]) {
          typeQueue.push(SPATIAL_CLASSES_REV[currentType]);
        }
      }
    }

    return Object.fromEntries(
      [...map.entries()].map(([k, v]) => [k, Array.from(v)]),
    ) as Record<
      SpatialEntityType,
      Feature<GeoJSON.Geometry, SpatialProperty>[]
    >;
  });

  const getAreaKeyForFeature = (
    feature: {
      properties?: { ancestors?: string[]; intersectsPlace?: string[] };
    } | null,
  ): AreaKey | null => {
    if (!feature?.properties?.ancestors) return null;

    const targetAncestors = [...feature.properties.ancestors];
    for (const intersectId of feature.properties.intersectsPlace ?? []) {
      targetAncestors.push(
        intersectId,
        ...(idMap.value.get(intersectId)?.properties?.ancestors ?? []),
      );
    }

    for (const [areaKey, areaId] of Object.entries(AREA_ID_MAP)) {
      if (targetAncestors.includes(areaId)) {
        return areaKey as AreaKey;
      }
    }
    return null;
  };

  const getFloorForFeature = (
    feature: { properties?: { ancestors?: string[] } } | null,
  ): FloorLevel | null => {
    if (!feature?.properties?.ancestors) return null;
    for (const ancestorId of feature.properties.ancestors) {
      const ancestorFeature = idMap.value.get(ancestorId);
      if (ancestorFeature?.properties?.type === "Storey") {
        return new FloorLevel(ancestorFeature.properties.floorLevel);
      }
    }
    return null;
  };

  return {
    geojson,
    buildingCentroids,
    floorCentroids,
    typeMap,
    paths,
    idMap,
    getAreaKeyForFeature,
    getFloorForFeature,
  };
};
