import { ref, computed } from "vue";
import paths from "@/assets/paths.json";
import { UEC_ATLAS_SPATIAL_URL } from "@uec-atlas/uec-map-sdk";
import { centerOfMass } from "@turf/turf";
import type { Feature, FeatureCollection } from "geojson";

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

function traverseParentFeatures(
  feature: GeoJSON.Feature,
  data: FeatureCollection,
): GeoJSON.Feature[] {
  const parentId = feature.properties?.containedInPlace;
  if (!parentId) return [];
  const parentFeature = data.features.find((f) => f.id === parentId);
  if (!parentFeature) return [];
  return [parentFeature, ...traverseParentFeatures(parentFeature, data)];
}

const data = ref<FeatureCollection | null>(null);

$fetch<FeatureCollection>(UEC_ATLAS_SPATIAL_URL).then((d) => {
  for (const feature of d.features) {
    if (!feature.properties) continue;
    feature.properties.ancestors = traverseParentFeatures(feature, d).map(
      (f) => f.id,
    );
  }
  data.value = d;
});

export const useSpatialEntries = () => {
  const typeMap = computed(() => {
    const map = new Map<SpatialEntityType, Set<Feature>>();
    for (const type of Object.entries(SPATIAL_CLASSES).flat().flat()) {
      if (!map.has(type as SpatialEntityType)) {
        map.set(type as SpatialEntityType, new Set());
      }
    }
    for (const feature of data.value?.features || []) {
      if (!feature.properties) continue;
      feature.properties.id = feature.id?.toString() || "";

      if (feature.properties.amenities) {
        for (const amenity of feature.properties.amenities) {
          feature.properties[`amenity:${amenity.propertyID}`] = true;
        }
      }

      const typeQueue = [feature.properties.type] as string[];
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

  const buildingCentroids = computed(
    () =>
      typeMap.value.Building.map((building) => {
        try {
          return centerOfMass(building, { properties: building.properties });
        } catch {
          return null;
        }
      }).filter((v): v is NonNullable<typeof v> => !!v) ?? [],
  );

  const floorCentroids = computed(
    () =>
      [
        ...(typeMap.value.Room ?? []),
        ...(typeMap.value.Facility ?? []),
        ...(typeMap.value.Passage ?? []),
      ]
        .map((storey) => {
          try {
            return centerOfMass(storey, { properties: storey.properties });
          } catch {
            return null;
          }
        })
        .filter((v): v is NonNullable<typeof v> => !!v) ?? [],
  );

  const idMap = computed(() => {
    const map = new Map<string, GeoJSON.Feature>();
    if (!data.value) return map;
    for (const feature of data.value.features) {
      const id = feature.properties?.id;
      if (id) {
        map.set(id, feature);
      }
    }
    return map;
  });

  const getAreaKeyForFeature = (
    feature: {
      properties?: { ancestors?: string[]; intersectsPlace?: string[] };
    } | null,
  ): AreaKey | null => {
    const targetAncestors = [...(feature?.properties?.ancestors ?? [])];
    for (const intersectId of feature?.properties?.intersectsPlace ?? []) {
      targetAncestors.push(
        intersectId,
        ...(idMap.value.get(intersectId)?.properties?.ancestors ?? []),
      );
    }
    if (!feature?.properties?.ancestors) return null;
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
    data,
    buildingCentroids,
    floorCentroids,
    typeMap,
    paths: paths as FeatureCollection<GeoJSON.LineString>,
    idMap,
    getAreaKeyForFeature,
    getFloorForFeature,
  };
};
