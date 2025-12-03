import { UEC_MAP_SOURCE_ID } from "@e-chan1007/uec-map-sdk";
import { withLanguageSuffixFactory } from "../utils/lang";
import { defineLayerFactory } from "../utils/layer";
import { ZOOM_LEVELS } from "../theme/zoom";
import type { ColorMode } from "../theme/colors";

export const createAreaLayers = defineLayerFactory((mode: ColorMode) => [
  {
    id: "areas_outline",
    type: "line",
    source: UEC_MAP_SOURCE_ID,
    "source-layer": "areas",
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
    "source-layer": "areas",
    minzoom: 0,
    paint: { "fill-color": mode === "dark" ? "#222222" : "#fafafa" },
  },
]);

export const createAreaLabelLayers = defineLayerFactory(
  (language: string, mode: ColorMode) => {
    const withLanguageSuffix = withLanguageSuffixFactory(language);

    return {
      id: "areas_label",
      type: "symbol",
      source: UEC_MAP_SOURCE_ID,
      "source-layer": "areas_label",
      minzoom: 0,
      maxzoom: ZOOM_LEVELS.MAIN_BUILDING,
      layout: {
        "text-field": ["get", withLanguageSuffix("name")],
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
