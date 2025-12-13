import { UEC_MAP_SOURCE_ID } from "@e-chan1007/uec-map-sdk";
import { withLanguageSuffixFactory } from "../utils/lang";
import { defineLayerFactory } from "../utils/layer";
import { ZOOM_LEVELS } from "../theme/zoom";
import type { ColorMode } from "../theme/colors";
import { overlap, smallLabel, smallIcon, smallIconScale } from "../theme/icons";
import type { LayerSpecification } from "maplibre-gl";

export const createGateLayers = defineLayerFactory(
  (
    language: string,
    mode: ColorMode,
    isDesktop = true,
  ): LayerSpecification[] => {
    const withLanguageSuffix = withLanguageSuffixFactory(language);

    return [
      {
        id: "gates-icon-shadow",
        type: "circle",
        source: UEC_MAP_SOURCE_ID,
        "source-layer": "gates",
        minzoom: ZOOM_LEVELS.MAIN_BUILDING,
        paint: {
          "circle-radius": smallIcon(isDesktop),
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
          "circle-radius": smallIcon(isDesktop),
          "circle-color": "#969696",
          "circle-stroke-color": mode === "dark" ? "#CCCCCC" : "#FFFFFF",
          "circle-stroke-width": 2,
        },
      },
      {
        id: "gates-icon-symbol",
        type: "symbol",
        source: UEC_MAP_SOURCE_ID,
        "source-layer": "gates",
        minzoom: ZOOM_LEVELS.MAIN_BUILDING,
        layout: {
          "icon-image": MAP_ICONS["material-symbols:gate"],
          "icon-size": smallIconScale(isDesktop),
          "icon-padding": 0,
          "icon-allow-overlap": true,
          "icon-ignore-placement": true,
          "icon-optional": false,
        },
        paint: {
          "icon-color": "#FFFFFF",
        },
      },
      {
        id: "gates-text-symbol",
        type: "symbol",
        source: UEC_MAP_SOURCE_ID,
        "source-layer": "gates",
        minzoom: ZOOM_LEVELS.MAIN_BUILDING,
        layout: {
          "text-field": ["get", withLanguageSuffix("name")],
          "text-optional": true,
          "text-size": smallLabel(isDesktop),
          "text-max-width": 16,
          "text-offset": [0, 1.6],
          "text-allow-overlap": overlap(),
          "text-padding": 0,
        },
        paint: {
          "text-color": mode === "dark" ? "#FFFFFF" : "#000000",
          "text-halo-color": mode === "dark" ? "#000000" : "#FFFFFF",
          "text-halo-width": 2,
        },
      },
    ] as unknown as LayerSpecification[];
  },
);
