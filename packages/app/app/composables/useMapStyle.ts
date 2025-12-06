import { buildMapStyle } from "@e-chan1007/uec-map-sdk";
import type { Ref } from "vue";
import { computed } from "vue";
import { createEntrancesLayers } from "~/map-style/layers/entrances";
import {
  createAreaLabelLayers,
  createAreaLayers,
} from "../map-style/layers/areas";
import {
  createBuildingDetailIconLayers,
  createBuildingIconLayers,
  createBuildingLayers,
} from "../map-style/layers/buildings";
import { createExtrusionLayers } from "../map-style/layers/extrusion";
import { createFloorLayers } from "../map-style/layers/floors";
import { createGateLayers } from "../map-style/layers/gates";
import { createOsmLayers } from "../map-style/layers/osm";
import { createPathLayers } from "../map-style/layers/paths";
import type { ColorMode } from "~/map-style/theme/colors";
import { createSelectedObjectLayers } from "~/map-style/layers/selectedObject";

export const useMapStyle = (
  shouldUseExtrusion: Ref<boolean>,
  language: Ref<string>,
) =>
  computed(() => {
    const { floor, selectedObject, pathFindResult } = useMapState();
    const mode = useColorMode().value as ColorMode;
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
          data: { type: "FeatureCollection", features: pathFindResult.value ? [pathFindResult.value] : []},
        },
        selectedObject: {
          type: "geojson",
          data: { type: "Feature", geometry: selectedObject.value ? selectedObject.value.geometry : { type: "Polygon", coordinates: [] }, properties: {} },
        },
      },
      layers: [
        {
          id: "background",
          type: "background",
          paint: {
            "background-color": mode === "dark" ? "#0B0B1A" : "#FFFFFF",
          },
        },
        ...createOsmLayers(mode),
        ...createAreaLayers(mode),
        ...createPathLayers(mode),
        ...createBuildingLayers(mode),
        ...createEntrancesLayers(mode),
        ...createExtrusionLayers(floor.value, shouldUseExtrusion.value, mode),
        ...createAreaLabelLayers(language.value, mode),
        ...createBuildingDetailIconLayers(language.value, mode),
        ...createGateLayers(language.value, mode),
        ...createBuildingIconLayers(language.value, mode),
        ...createFloorLayers(
          floor.value,
          shouldUseExtrusion.value,
          language.value,
          mode,
        ),
        ...createSelectedObjectLayers(mode)
      ],
    });
  });
