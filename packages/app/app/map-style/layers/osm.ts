import { defineLayerFactory } from "../utils/layer";

export const createOsmLayers = defineLayerFactory(() => [
  {
    id: "water",
    type: "fill",
    source: "osm",
    "source-layer": "water",
    paint: { "fill-color": "#ddecfcff" },
  },
  {
    id: "buildings-2d",
    type: "fill",
    source: "osm",
    "source-layer": "building",
    minzoom: 13,
    paint: { "fill-color": "#f0f0f0", "fill-outline-color": "#eaeaea" },
  },
  {
    id: "roads-minor",
    type: "line",
    source: "osm",
    "source-layer": "transportation",
    minzoom: 12,
    filter: ["in", "class", "minor", "street", "service"],
    paint: { "line-color": "#f0f0f0", "line-width": 3 },
  },
  {
    id: "roads-major",
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
    paint: { "line-color": "#eaeaea", "line-width": 3 },
  },
]);
