import { UEC_MAP_SOURCE_ID } from "@e-chan1007/uec-map-sdk";
import type { FilterSpecification } from "maplibre-gl";
import { FLOOR_ICON_BG_COLOR, TYPE_COLOR_MAP } from "../theme/colors";
import { buildMatch } from "../utils/expressions";
import { withLanguageSuffixFactory } from "../utils/lang";
import { defineLayerFactory } from "../utils/layer";
import { ZOOM_LEVELS } from "../theme/zoom";

export const createFloorLayers = defineLayerFactory(
  (floor: number, shouldUseExtrusion: boolean, language: string) => {
    const withLanguageSuffix = withLanguageSuffixFactory(language);

    const floorIconFilter: FilterSpecification = [
      "all",
      ["==", ["get", "floor"], floor],
      ["!", ["in", ["get", "type"], ["literal", ["corridor", "misc"]]]],
    ];

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
          "fill-color": buildMatch("type", TYPE_COLOR_MAP, "#31A6D4"),
          "fill-outline-color": "#232323",
        },
      },
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
          "circle-color": buildMatch("type", FLOOR_ICON_BG_COLOR, "#969696"),
          "circle-stroke-color": "#FFFFFF",
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
          "icon-image": [
            "match",
            ["get", "type"],
            "elevator",
            MAP_ICONS["material-symbols:elevator-outline"],
            "stairs",
            MAP_ICONS["material-symbols:stairs-2"],
            "lecture_room",
            MAP_ICONS["material-symbols:co-present"],
            "wc_universal",
            MAP_ICONS["map:toilet"],
            "wc_unknown",
            MAP_ICONS["map:toilet"],
            "wc_men",
            MAP_ICONS["material-symbols:man"],
            "wc_women",
            MAP_ICONS["material-symbols:woman"],
            "common_space",
            MAP_ICONS["material-symbols:groups"],
            "office",
            MAP_ICONS["material-symbols:checkbook"],
            MAP_ICONS["mdi:town-hall"],
          ],
          "icon-size": 0.8,
          "icon-padding": 0,
          "text-padding": 0,
          "text-field": ["get", withLanguageSuffix("name")],
          "text-size": 12,
          "text-max-width": 16,
          "text-offset": [0, 1.5],
          "icon-allow-overlap": true,
          "text-allow-overlap": true,
        },
        paint: {
          "text-color": "#000000",
          "icon-color": "#FFFFFF",
          "text-halo-color": "#FFFFFF",
          "text-halo-width": 1,
        },
      },
    ];
  },
);
