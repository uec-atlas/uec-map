import type { ColorMode } from "../theme/colors";
import { defineLayerFactory } from "../utils/layer";

export const createOsmLayers = defineLayerFactory((theme: ColorMode) => [
  {
    id: "osm-water",
    type: "fill",
    source: "osm",
    "source-layer": "water",
    paint: { "fill-color": theme === "dark" ? "#0B0B0B" : "#ddecfcff" },
  },
  {
    id: "osm-buildings",
    type: "fill",
    source: "osm",
    "source-layer": "building",
    minzoom: 13,
    paint: {
      "fill-color": theme === "dark" ? "#2b2b2b" : "#f0f0f0",
      "fill-outline-color": theme === "dark" ? "#1a1a1a" : "#eaeaea",
    },
  },
  {
    id: "osm-roads-minor",
    type: "line",
    source: "osm",
    "source-layer": "transportation",
    minzoom: 12,
    filter: ["in", "class", "minor", "street", "service"],
    paint: {
      "line-color": theme === "dark" ? "#1a1a1a" : "#f0f0f0",
      "line-width": 3,
    },
  },
  {
    id: "osm-roads-major",
    type: "line",
    source: "osm",
    "source-layer": "transportation",
    filter: [
      "in",
      "class",
      "motorway",
      "trunk",
      "primary",
      "secondary",
      "tertiary",
    ],
    paint: {
      "line-color": theme === "dark" ? "#2b2b2b" : "#eaeaea",
      "line-width": 4,
    },
  },
]);
