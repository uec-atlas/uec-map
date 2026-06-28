import { UEC_MAP_SOURCE_ID } from "@uec-atlas/uec-map-sdk";
import type { ExpressionSpecification } from "maplibre-gl";
import type { ColorMode } from "../theme/colors";
import { ZOOM_LEVELS } from "../theme/zoom";
import { defineLayerFactory } from "../utils/layer";
import { nameField } from "../utils/lang";

const areaFilter = [
  "in",
  ["get", "type"],
  ["literal", ["Site", "Area"]],
] as const satisfies ExpressionSpecification;

export const createAreaLayers = defineLayerFactory((mode: ColorMode) => [
  {
    id: "areas_outline",
    type: "line",
    source: UEC_MAP_SOURCE_ID,
    filter: areaFilter,
    minzoom: 0,
    paint: {
      "line-color": mode === "dark" ? "#444444" : "#cccccc",
      "line-width": 4,
    },
  },
  {
    id: "areas",
    type: "fill",
    source: UEC_MAP_SOURCE_ID,
    filter: areaFilter,
    minzoom: 0,
    paint: { "fill-color": mode === "dark" ? "#222222" : "#fafafa" },
  },
]);

export const createAreaLabelLayers = defineLayerFactory(
  (language: string, mode: ColorMode) => {
    return {
      id: "areas_label",
      type: "symbol",
      source: UEC_MAP_SOURCE_ID,
      filter: areaFilter,
      minzoom: 0,
      maxzoom: ZOOM_LEVELS.MAIN_BUILDING,
      layout: {
        "text-field": nameField(language),
        "text-size": 16,
        "text-max-width": 12,
      },
      paint: {
        "text-color": mode === "dark" ? "#FFFFFF" : "#000000",
        "text-halo-color": mode === "dark" ? "#000000" : "#FFFFFF",
        "text-halo-width": 2,
      },
    };
  },
);
