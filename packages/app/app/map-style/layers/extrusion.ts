import { UEC_MAP_SOURCE_ID } from "@e-chan1007/uec-map-sdk";
import { getTypeColorMap, type ColorMode } from "../theme/colors";
import { ZOOM_LEVELS } from "../theme/zoom";
import { buildMatch } from "../utils/expressions";
import { defineLayerFactory } from "../utils/layer";

export const createExtrusionLayers = defineLayerFactory(
  (floor: number, shouldUseExtrusion: boolean, mode: ColorMode) => {
    const TYPE = getTypeColorMap(mode);
    return [
      {
        id: "building-extrusion",
        type: "fill-extrusion",
        source: UEC_MAP_SOURCE_ID,
        "source-layer": "floors",
        minzoom: 0,
        layout: { visibility: shouldUseExtrusion ? "visible" : "none" },
        filter: ["<", ["zoom"], ZOOM_LEVELS.BUILDING_DETAILS],
        paint: {
          "fill-extrusion-color": "#AAAAAA",
          "fill-extrusion-base": ["*", ["-", ["get", "floor"], 1], 5],
          "fill-extrusion-opacity": 0.75,
          "fill-extrusion-vertical-gradient": false,
          "fill-extrusion-height": ["*", ["get", "floor"], 5],
        },
      },
      {
        id: "below-floor-extrusion",
        type: "fill-extrusion",
        source: UEC_MAP_SOURCE_ID,
        "source-layer": "floors",
        minzoom: 0,
        layout: { visibility: shouldUseExtrusion ? "visible" : "none" },
        filter: [
          "all",
          [">=", ["zoom"], ZOOM_LEVELS.BUILDING_DETAILS],
          ["<", ["get", "floor"], floor],
        ],
        paint: {
          "fill-extrusion-color": "#AAAAAA",
          "fill-extrusion-base": ["*", ["-", ["get", "floor"], 1], 5],
          "fill-extrusion-opacity": 0.75,
          "fill-extrusion-vertical-gradient": false,
          "fill-extrusion-height": ["*", ["get", "floor"], 5],
        },
      },
      {
        id: "current-floor-extrusion",
        type: "fill-extrusion",
        source: UEC_MAP_SOURCE_ID,
        "source-layer": "floors",
        minzoom: 0,
        layout: { visibility: shouldUseExtrusion ? "visible" : "none" },
        filter: [
          "all",
          [">=", ["zoom"], ZOOM_LEVELS.BUILDING_DETAILS],
          ["==", ["get", "floor"], floor],
        ],
        paint: {
          "fill-extrusion-color": buildMatch("type", TYPE, "#31A6D4"),
          "fill-extrusion-base": ["*", ["-", ["get", "floor"], 1], 5],
          "fill-extrusion-opacity": 1,
          "fill-extrusion-vertical-gradient": false,
          "fill-extrusion-height": [
            "+",
            ["*", ["-", ["get", "floor"], 1], 5],
            0.01,
          ],
        },
      },
      {
        id: "ceiling-extrusion",
        type: "fill-extrusion",
        source: UEC_MAP_SOURCE_ID,
        "source-layer": "floors",
        minzoom: 0,
        layout: { visibility: shouldUseExtrusion ? "visible" : "none" },
        filter: [
          "all",
          [">=", ["zoom"], ZOOM_LEVELS.BUILDING_DETAILS],
          ["<", ["get", "floor"], floor],
        ],
        paint: {
          "fill-extrusion-color": "#AAAAAA",
          "fill-extrusion-base": ["*", ["get", "floor"], 5],
          "fill-extrusion-opacity": 0.75,
          "fill-extrusion-vertical-gradient": false,
          "fill-extrusion-height": ["*", ["get", "floor"], 5],
        },
      },
    ];
  },
);
