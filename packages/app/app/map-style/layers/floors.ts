import { UEC_MAP_SOURCE_ID } from "@e-chan1007/uec-map-sdk";
import type { FilterSpecification } from "maplibre-gl";
import {
  getTypeColorMap,
  getFloorIconBgColor,
  type ColorMode,
} from "../theme/colors";
import { buildMatch } from "../utils/expressions";
import { withLanguageSuffixFactory } from "../utils/lang";
import { defineLayerFactory } from "../utils/layer";
import { ZOOM_LEVELS } from "../theme/zoom";
import { FLOOR_ICONS } from "../theme/icons";

export const createFloorLayers = defineLayerFactory(
  (floor: number, shouldUseExtrusion: boolean, mode: ColorMode) => {
    const TYPE = getTypeColorMap(mode);

    return [
      {
        id: "floors",
        type: "fill",
        source: UEC_MAP_SOURCE_ID,
        "source-layer": "floors",
        minzoom: ZOOM_LEVELS.BUILDING_DETAILS,
        filter: ["==", ["get", "floor"], floor],
        layout: { visibility: shouldUseExtrusion ? "none" : "visible" },
        paint: {
          "fill-color": buildMatch("type", TYPE, "#31A6D4"),
          "fill-outline-color": "#232323",
        },
      },
    ];
  },
);

export const createFloorIconLayers = defineLayerFactory(
  (
    floor: number,
    shouldUseExtrusion: boolean,
    language: string,
    mode: ColorMode,
  ) => {
    const withLanguageSuffix = withLanguageSuffixFactory(language);
    const FLOOR_BG = getFloorIconBgColor(mode);

    const floorIconFilter: FilterSpecification = [
      "all",
      ["==", ["get", "floor"], floor],
      ["!", ["in", ["get", "type"], ["literal", ["corridor", "misc"]]]],
    ];

    return [
      {
        id: "floors-icon-shadow",
        type: "circle",
        source: UEC_MAP_SOURCE_ID,
        "source-layer": "floors_label",
        minzoom: ZOOM_LEVELS.BUILDING_DETAILS,
        filter: floorIconFilter,
        layout: { visibility: shouldUseExtrusion ? "none" : "visible" },
        paint: {
          "circle-radius": 16,
          "circle-blur": 0.7,
          "circle-color": "#000000AA",
          "circle-translate": [0, 2],
        },
      },
      {
        id: "floors-icon-background",
        type: "circle",
        source: UEC_MAP_SOURCE_ID,
        "source-layer": "floors_label",
        minzoom: ZOOM_LEVELS.BUILDING_DETAILS,
        filter: floorIconFilter,
        layout: { visibility: shouldUseExtrusion ? "none" : "visible" },
        paint: {
          "circle-radius": 14,
          "circle-color": buildMatch("type", FLOOR_BG, "#969696"),
          "circle-stroke-color": mode === "dark" ? "#CCCCCC" : "#FFFFFF",
          "circle-stroke-width": 2,
        },
      },
      {
        id: "floors-label",
        type: "symbol",
        source: UEC_MAP_SOURCE_ID,
        "source-layer": "floors_label",
        minzoom: ZOOM_LEVELS.BUILDING_DETAILS,
        filter: floorIconFilter,
        layout: {
          visibility: shouldUseExtrusion ? "none" : "visible",
          "icon-image": buildMatch("type", FLOOR_ICONS, FLOOR_ICONS["default"]),
          "icon-size": 0.8,
          "icon-padding": 0,
          "text-padding": 0,
          "text-field": ["get", withLanguageSuffix("name")],
          "text-size": 14,
          "text-max-width": 16,
          "text-offset": [0, 2],
          "icon-allow-overlap": true,
          "text-allow-overlap": true,
        },
        paint: {
          "text-color": mode === "dark" ? "#FFFFFF" : "#000000",
          "icon-color": "#FFFFFF",
          "text-halo-color": mode === "dark" ? "#000000" : "#FFFFFF",
          "text-halo-width": 1,
        },
      },
      {
        id: "floors-alt-label",
        type: "symbol",
        source: UEC_MAP_SOURCE_ID,
        "source-layer": "floors_label",
        minzoom: ZOOM_LEVELS.BUILDING_DETAILS,
        filter: floorIconFilter,
        layout: {
          visibility: shouldUseExtrusion ? "none" : "visible",
          "text-padding": 0,
          "text-field": ["get", withLanguageSuffix("altname")],
          "text-size": 12,
          "text-anchor": "top",
          "text-optional": true,
          "text-offset": [0, 3],
        },
        paint: {
          "text-color": mode === "dark" ? "#FFFFFF" : "#000000",
          "text-halo-color": mode === "dark" ? "#000000" : "#FFFFFF",
          "text-halo-width": 2,
        },
      },
    ];
  },
);
