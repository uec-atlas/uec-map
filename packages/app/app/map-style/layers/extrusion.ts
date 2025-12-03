import { UEC_MAP_SOURCE_ID } from "@e-chan1007/uec-map-sdk";
import { TYPE_COLOR_MAP } from "../theme/colors";
import { buildMatch } from "../utils/expressions";
import { defineLayerFactory } from "../utils/layer";
import { ZOOM_LEVELS } from "../theme/zoom";

export const createExtrusionLayers = defineLayerFactory(
  (floor: number, shouldUseExtrusion: boolean) => [
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
        "fill-extrusion-color": buildMatch("type", TYPE_COLOR_MAP, "#31A6D4"),
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
  ],
);
