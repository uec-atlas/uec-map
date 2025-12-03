import { buildMapStyle, UEC_MAP_SOURCE_ID } from "@e-chan1007/uec-map-sdk";
import { computed } from "vue";
import type { Ref } from "vue";
import type {
  FilterSpecification,
  LayerSpecification,
  Expression,
  DataDrivenPropertyValueSpecification,
  ExpressionSpecification,
} from "maplibre-gl";
import { buildMatch } from "../map-style/utils/expressions";
import {
  createAreaLabelLayers,
  createAreaLayers,
} from "../map-style/layers/areas";
import { createPathLayers } from "../map-style/layers/paths";
import { createGateLayers } from "../map-style/layers/gates";
import {
  createBuildingLayers,
  createBuildingIconLayers,
  createBuildingDetailIconLayers,
} from "../map-style/layers/buildings";
import { createExtrusionLayers } from "../map-style/layers/extrusion";
import { createFloorLayers } from "../map-style/layers/floors";
import { createOsmLayers } from "../map-style/layers/osm";
import { createEntrancesLayers } from "~/map-style/layers/entrances";

export const useMapStyle = (
  floor: Ref<number>,
  shouldUseExtrusion: Ref<boolean>,
  language: Ref<string>,
) =>
  computed(() => {
    // Layer factories are provided by ../map-style/layers/*. Use those.

    return buildMapStyle({
      version: 8,
      sources: {
        osm: {
          type: "vector",
          url: "pmtiles://https://tile.openstreetmap.jp/static/planet.pmtiles",
          attribution: "&copy; OpenStreetMap contributors",
        },
        pathFindResult: {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
        },
      },
      layers: [
        ...createOsmLayers(),
        ...createAreaLayers(),
        ...createPathLayers(),
        ...createBuildingLayers(),
        ...createEntrancesLayers(),
        ...createExtrusionLayers(floor.value, shouldUseExtrusion.value),
        ...createAreaLabelLayers(language.value),
        ...createBuildingDetailIconLayers(language.value),
        ...createGateLayers(language.value),
        ...createBuildingIconLayers(language.value),
        ...createFloorLayers(
          floor.value,
          shouldUseExtrusion.value,
          language.value,
        ),
      ],
    });
  });
