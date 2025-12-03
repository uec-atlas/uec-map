import areasGeoJSON from "@/assets/areas.json";
import { pointToPolygonDistance } from "@turf/turf";
import type { Polygon } from "geojson";

export const distanceToUEC = (lnglat: [number, number]) => {;
  let minDistance = Infinity;
  for (const area of areasGeoJSON.features) {
    const distance = pointToPolygonDistance(lnglat, area.geometry as Polygon, { units: "meters" });
    if (distance < minDistance) {
      minDistance = distance;
    }
  }
  return minDistance;
}

export const aroundUECRadiusMeters = 200;
export const isAroundUEC = (lnglat: [number, number]) => {
  return distanceToUEC(lnglat) <= aroundUECRadiusMeters;
}
