import { UEC_MAP_SOURCE_ID } from "@e-chan1007/uec-map-sdk";
import { defineLayerFactory } from "../utils/layer";
import { ZOOM_LEVELS } from "../theme/zoom";

export const createEntrancesLayers = defineLayerFactory(() => ({
  id: "entrances",
  type: "symbol",
  source: UEC_MAP_SOURCE_ID,
  "source-layer": "entrances",
  minzoom: ZOOM_LEVELS.ALL_BUILDINGS,
  layout: {
    "icon-image": MAP_ICONS["mdi:triangle"],
    "icon-size": 0.75,
    "icon-allow-overlap": true,
    "icon-offset": [0, 12],
    "icon-rotation-alignment": "map",
    "icon-rotate": ["get", "bearing"],
  },
}));
