import { UEC_MAP_SOURCE_ID } from "@uec-atlas/uec-map-sdk";
import type { ExpressionSpecification, LayerSpecification } from "maplibre-gl";
import { getFillColorSpec, type ColorMode } from "../theme/colors";
import { ZOOM_LEVELS } from "../theme/zoom";
import { defineLayerFactory } from "../utils/layer";

const makeAncestorFilter = (storeyIds: string[]): ExpressionSpecification =>
  [
    "any",
    ...storeyIds.map((id) => ["in", id, ["array", ["get", "ancestors"]]]),
  ] as unknown as ExpressionSpecification;

const toFloorNumber = (floorLevel: string) =>
  floorLevel.startsWith("B")
    ? -Number(floorLevel.slice(1))
    : Number(floorLevel);

const createGrayExtrusion = (
  id: string,
  storeyIds: string[],
  floorLevel: number,
  shouldUseExtrusion: boolean,
  zoomRange: { maxzoom?: number; minzoom?: number },
): LayerSpecification => ({
  id,
  type: "fill-extrusion",
  source: UEC_MAP_SOURCE_ID,
  ...zoomRange,
  layout: { visibility: shouldUseExtrusion ? "visible" : "none" },
  filter: makeAncestorFilter(storeyIds),
  paint: {
    "fill-extrusion-color": "#AAAAAA",
    "fill-extrusion-base": (floorLevel - 1) * 5,
    "fill-extrusion-vertical-gradient": false,
    "fill-extrusion-height": floorLevel * 5,
  },
});

export const createExtrusionLayers = defineLayerFactory(
  (floor: FloorLevel, shouldUseExtrusion: boolean, mode: ColorMode) => {
    if (floor.level < 0) return [];
    const { typeMap } = useSpatialEntries();

    const storeyMap = typeMap.value.Storey.reduce(
      (acc, s) => {
        const fl = toFloorNumber(s.properties.floorLevel);
        if (!acc[fl]) acc[fl] = [];
        acc[fl].push(s.id as string);
        return acc;
      },
      {} as Record<number, string[]>,
    );

    const currentStoreyIds = storeyMap[floor.level] ?? [];

    const aboveStoreyGroups = Object.fromEntries(
      Object.entries(storeyMap).filter(([fl]) => Number(fl) >= 1),
    );
    const maxFloor = Math.max(0, ...Object.keys(aboveStoreyGroups).map(Number));
    const allAboveStoreyIds = Object.values(aboveStoreyGroups).flat();

    const belowStoreyGroups = Object.fromEntries(
      Object.entries(aboveStoreyGroups).filter(
        ([fl]) => 1 <= Number(fl) && Number(fl) < floor.level,
      ),
    );

    const grayLayers = (
      entries: [string, string[]][],
      zoomRange: { maxzoom?: number; minzoom?: number },
    ) =>
      entries.map(([fl, ids]) =>
        createGrayExtrusion(
          `${"minzoom" in zoomRange ? "below-floor" : "building"}-extrusion-${fl}`,
          ids,
          Number(fl),
          shouldUseExtrusion,
          zoomRange,
        ),
      );

    return [
      ...grayLayers(Object.entries(belowStoreyGroups), {
        maxzoom: ZOOM_LEVELS.BUILDING_DETAILS,
      }),
      {
        id: "building-extrusion",
        type: "fill-extrusion",
        source: UEC_MAP_SOURCE_ID,
        minzoom: 0,
        maxzoom: ZOOM_LEVELS.BUILDING_DETAILS,
        layout: { visibility: shouldUseExtrusion ? "visible" : "none" },
        filter: makeAncestorFilter(allAboveStoreyIds),
        paint: {
          "fill-extrusion-color": "#AAAAAA",
          "fill-extrusion-base": 0,
          "fill-extrusion-vertical-gradient": false,
          "fill-extrusion-height": maxFloor * 5,
        },
      },
      ...grayLayers(Object.entries(belowStoreyGroups), {
        minzoom: ZOOM_LEVELS.BUILDING_DETAILS,
      }),
      {
        id: "current-floor-extrusion",
        type: "fill-extrusion",
        source: UEC_MAP_SOURCE_ID,
        minzoom: ZOOM_LEVELS.BUILDING_DETAILS,
        layout: { visibility: shouldUseExtrusion ? "visible" : "none" },
        filter: makeAncestorFilter(currentStoreyIds),
        paint: {
          "fill-extrusion-color": getFillColorSpec(mode),
          "fill-extrusion-base": (floor.level - 1) * 5,
          "fill-extrusion-vertical-gradient": false,
          "fill-extrusion-height": floor.level * 5,
        },
      },
    ];
  },
);
