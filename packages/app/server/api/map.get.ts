import { centerOfMass } from "@turf/turf";
import { UEC_ATLAS_SPATIAL_URL } from "@uec-atlas/uec-map-sdk";
import type { Feature, FeatureCollection, Point } from "geojson";
import pathsData from "@/assets/paths.json";

export default defineCachedEventHandler(
  async () => {
    const raw = await $fetch<FeatureCollection>(UEC_ATLAS_SPATIAL_URL);

    const idToFeature = new Map<string, Feature>();
    for (const feature of raw.features) {
      if (feature.id) idToFeature.set(String(feature.id), feature);
    }

    const buildingCentroids: Feature<Point>[] = [];
    const floorCentroids: Feature<Point>[] = [];

    for (const feature of raw.features) {
      if (!feature.properties) continue;

      feature.properties.id = feature.id ? String(feature.id) : "";

      const ancestors: string[] = [];
      let parentId = feature.properties.containedInPlace;
      while (parentId) {
        const parent = idToFeature.get(parentId);
        if (!parent?.id) break;
        ancestors.push(String(parent.id));
        parentId = parent.properties?.containedInPlace;
      }
      feature.properties.ancestors = ancestors;

      if (Array.isArray(feature.properties.amenities)) {
        for (const amenity of feature.properties.amenities) {
          feature.properties[`amenity:${amenity.propertyID}`] = true;
        }
      }

      const type = feature.properties.type;
      const needsBuildingCentroid = type === "Structure" || type === "Building";
      const needsFloorCentroid = [
        "Room",
        "Classroom",
        "PracticeRoom",
        "ResearchLaboratory",
        "Restroom",
        "RoomSubZone",
        "Facility",
        "Passage",
      ].includes(type);

      if (needsBuildingCentroid || needsFloorCentroid) {
        try {
          const pt = centerOfMass(feature, { properties: feature.properties });
          if (needsBuildingCentroid) buildingCentroids.push(pt);
          if (needsFloorCentroid) floorCentroids.push(pt);
        } catch {}
      }
    }

    return {
      geojson: raw,
      buildingCentroids,
      floorCentroids,
      paths: pathsData as FeatureCollection,
    };
  },
  {
    maxAge: 60 * 60 * 24,
    swr: true,
  },
);
