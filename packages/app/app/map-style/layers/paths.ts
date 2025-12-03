import { UEC_MAP_SOURCE_ID } from "@e-chan1007/uec-map-sdk";
import { defineLayerFactory } from "../utils/layer";
import type { ColorMode } from "../theme/colors";

export const createPathLayers = defineLayerFactory((theme: ColorMode) => [
  {
    id: "paths_outline",
    type: "line",
    source: UEC_MAP_SOURCE_ID,
    "source-layer": "paths",
    filter: ["!=", "hidden", true],
    minzoom: 0,
    paint: {
      "line-color": "#666666",
      "line-width": [
        "interpolate",
        ["exponential", 2],
        ["zoom"],
        10,
        ["+", ["*", ["get", "weight"], ["^", 2, -6]], 2],
        24,
        ["+", ["*", ["get", "weight"], ["^", 2, 8]], 2],
      ],
    },
    layout: { "line-cap": "round", "line-join": "round" },
  },
  {
    id: "paths",
    type: "line",
    source: UEC_MAP_SOURCE_ID,
    "source-layer": "paths",
    filter: ["!=", "hidden", true],
    minzoom: 0,
    paint: {
      "line-color": theme === "dark" ? "#444444" : "#FFFFFF",
      "line-width": [
        "interpolate",
        ["exponential", 2],
        ["zoom"],
        10,
        ["*", ["get", "weight"], ["^", 2, -6]],
        24,
        ["*", ["get", "weight"], ["^", 2, 8]],
      ],
    },
    layout: { "line-cap": "round", "line-join": "round" },
  },
  {
    id: "pathfind-result",
    type: "line",
    source: "pathFindResult",
    minzoom: 0,
    paint: {
      "line-color": "#FF0000",
      "line-width": 4,
    },
    layout: { "line-cap": "round", "line-join": "round" },
  },
]);
