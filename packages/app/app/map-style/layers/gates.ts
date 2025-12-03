import { UEC_MAP_SOURCE_ID } from "@e-chan1007/uec-map-sdk";
import { withLanguageSuffixFactory } from "../utils/lang";
import { defineLayerFactory } from "../utils/layer";
import { ZOOM_LEVELS } from "../theme/zoom";
import type { ColorMode } from "../theme/colors";

export const createGateLayers = defineLayerFactory(
  (language: string, mode: ColorMode) => {
    const withLanguageSuffix = withLanguageSuffixFactory(language);

    return [
      {
        id: "gates-icon-shadow",
        type: "circle",
        source: UEC_MAP_SOURCE_ID,
        "source-layer": "gates",
        minzoom: ZOOM_LEVELS.MAIN_BUILDING,
        paint: {
          "circle-radius": 18,
          "circle-blur": 0.7,
          "circle-color": "#000000AA",
          "circle-translate": [0, 2],
        },
      },
      {
        id: "gates-icon-background",
        type: "circle",
        source: UEC_MAP_SOURCE_ID,
        "source-layer": "gates",
        minzoom: ZOOM_LEVELS.MAIN_BUILDING,
        paint: {
          "circle-radius": 14,
          "circle-color": "#969696",
          "circle-stroke-color": mode === "dark" ? "#CCCCCC" : "#FFFFFF",
          "circle-stroke-width": 2,
        },
      },
      {
        id: "gates-label",
        type: "symbol",
        source: UEC_MAP_SOURCE_ID,
        "source-layer": "gates",
        minzoom: ZOOM_LEVELS.MAIN_BUILDING,
        layout: {
          "icon-image": MAP_ICONS["material-symbols:gate"],
          "icon-size": 0.8,
          "icon-padding": 0,
          "text-padding": 0,
          "text-allow-overlap": false,
          "icon-allow-overlap": true,
          "text-field": ["get", withLanguageSuffix("name")],
          "text-optional": true,
          "text-size": 14,
          "text-max-width": 16,
          "text-offset": [0, 1.5],
        },
        paint: {
          "text-color": mode === "dark" ? "#FFFFFF" : "#000000",
          "icon-color": "#FFFFFF",
          "text-halo-color": mode === "dark" ? "#000000" : "#FFFFFF",
          "text-halo-width": 2,
        },
      },
    ];
  },
);
