import type { ColorMode } from "../theme/colors";
import { defineLayerFactory } from "../utils/layer";

export const createSelectedObjectLayers = defineLayerFactory((mode: ColorMode) => [
  {
    id: "selected-object-outline",
    type: "line",
    source: "selectedObject",
    minzoom: 0,
    paint: {
      "line-color": mode === "dark" ? "#EB6120" : "#CC2244",
      "line-width": [
        "interpolate",
        ["exponential", 2],
        ["zoom"],
        15,
        2,
        20,
        8,
      ]
    },
  }
]);
