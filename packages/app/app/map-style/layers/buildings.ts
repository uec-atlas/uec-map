import type { LayerSpecification } from "maplibre-gl";
import { UEC_MAP_SOURCE_ID } from "@e-chan1007/uec-map-sdk";
import { BUILDING_AREA_COLOR, BUILDING_TYPE_ICON_COLOR } from "../theme/colors";
import { buildMatch } from "../utils/expressions";
import { defineLayerFactory } from "../utils/layer";
import { ZOOM_LEVELS } from "../theme/zoom";
import { withLanguageSuffixFactory } from "../utils/lang";

export const createBuildingLayers = defineLayerFactory(() => ({
  id: "buildings",
  type: "fill",
  source: UEC_MAP_SOURCE_ID,
  "source-layer": "buildings",
  minzoom: 0,
  paint: {
    "fill-color": buildMatch("area", BUILDING_AREA_COLOR, "#969696"),
    "fill-opacity": [
      "step",
      ["zoom"],
      ["match", ["get", "type"], "utility", 0.5, 1],
      ZOOM_LEVELS.BUILDING_DETAILS,
      0.15,
    ],
  },
}));

export const createBuildingIconLayers = defineLayerFactory(
  (language: string) => {
    const withLanguageSuffix = withLanguageSuffixFactory(language);
    return [
      {
        id: "buildings-icon-shadow",
        type: "circle",
        source: UEC_MAP_SOURCE_ID,
        "source-layer": "buildings_label",
        filter: ["!=", ["get", "type"], "utility"],
        minzoom: ZOOM_LEVELS.MAIN_BUILDING,
        maxzoom: ZOOM_LEVELS.BUILDING_DETAILS,
        paint: {
          "circle-radius": 18,
          "circle-blur": 0.7,
          "circle-color": "#000000AA",
          "circle-translate": [0, 2],
        },
      },
      {
        id: "buildings-icon-background",
        type: "circle",
        source: UEC_MAP_SOURCE_ID,
        "source-layer": "buildings_label",
        filter: ["!=", ["get", "type"], "utility"],
        minzoom: ZOOM_LEVELS.MAIN_BUILDING,
        maxzoom: ZOOM_LEVELS.BUILDING_DETAILS,
        paint: {
          "circle-radius": 16,
          "circle-color": buildMatch(
            "type",
            BUILDING_TYPE_ICON_COLOR,
            "#969696",
          ),
          "circle-stroke-color": "#FFFFFF",
          "circle-stroke-width": 2,
        },
      },
      {
        id: "buildings-label",
        type: "symbol",
        source: UEC_MAP_SOURCE_ID,
        "source-layer": "buildings_label",
        filter: ["!=", ["get", "type"], "utility"],
        minzoom: ZOOM_LEVELS.MAIN_BUILDING,
        maxzoom: ZOOM_LEVELS.BUILDING_DETAILS,
        layout: {
          "icon-image": [
            "match",
            ["get", "type"],
            "academic",
            MAP_ICONS["mdi:town-hall"],
            "office",
            MAP_ICONS["material-symbols:domain"],
            "community",
            MAP_ICONS["material-symbols:groups"],
            "residential",
            MAP_ICONS["material-symbols:home"],
            "fountain",
            MAP_ICONS["mdi:fountain"],
            MAP_ICONS["material-symbols:square"],
          ],
          "icon-padding": 0,
          "text-padding": 0,
          "text-allow-overlap": false,
          "icon-allow-overlap": true,
          "text-field": ["get", withLanguageSuffix("name")],
          "text-optional": true,
          "text-size": 14,
          "text-max-width": 16,
          "text-offset": [0, 1.5],
        },
        paint: {
          "text-color": "#000000",
          "icon-color": "#FFFFFF",
          "text-halo-color": "#FFFFFF",
          "text-halo-width": 2,
        },
      },
      {
        id: "buildings-alt-label",
        type: "symbol",
        source: UEC_MAP_SOURCE_ID,
        "source-layer": "buildings_label",
        filter: ["!=", ["get", "type"], "utility"],
        minzoom: ZOOM_LEVELS.MAIN_BUILDING,
        maxzoom: ZOOM_LEVELS.BUILDING_DETAILS,
        layout: {
          "text-padding": 0,
          "text-field": ["get", withLanguageSuffix("altname")],
          "text-size": 10,
          "text-anchor": "top",
          "text-optional": true,
          "text-offset": [0, 3],
        },
        paint: {
          "text-color": "#000000",
          "text-halo-color": "#FFFFFF",
          "text-halo-width": 1,
        },
      },
    ];
  },
);

export const createBuildingDetailIconLayers = defineLayerFactory(
  (language: string) => {
    const withLanguageSuffix = withLanguageSuffixFactory(language);
    return [
      {
        id: "buildings-detail-icon-shadow",
        type: "circle",
        source: UEC_MAP_SOURCE_ID,
        "source-layer": "buildings_label",
        filter: ["==", ["get", "type"], "utility"],
        minzoom: ZOOM_LEVELS.ALL_BUILDINGS,
        maxzoom: ZOOM_LEVELS.BUILDING_DETAILS,
        paint: {
          "circle-radius": 16,
          "circle-blur": 0.7,
          "circle-color": "#000000AA",
          "circle-translate": [0, 2],
        },
      },
      {
        id: "buildings-detail-icon-background",
        type: "circle",
        source: UEC_MAP_SOURCE_ID,
        "source-layer": "buildings_label",
        filter: ["==", ["get", "type"], "utility"],
        minzoom: ZOOM_LEVELS.ALL_BUILDINGS,
        maxzoom: ZOOM_LEVELS.BUILDING_DETAILS,
        paint: {
          "circle-radius": 14,
          "circle-color": "#969696",
          "circle-stroke-color": "#FFFFFF",
          "circle-stroke-width": 2,
        },
      },
      {
        id: "buildings-detail-label",
        type: "symbol",
        source: UEC_MAP_SOURCE_ID,
        "source-layer": "buildings_label",
        filter: ["==", ["get", "type"], "utility"],
        minzoom: ZOOM_LEVELS.ALL_BUILDINGS,
        maxzoom: ZOOM_LEVELS.BUILDING_DETAILS,
        layout: {
          "icon-image": MAP_ICONS["material-symbols:room-preferences"],
          "icon-size": 0.8,
          "icon-padding": 0,
          "text-padding": 0,
          "text-allow-overlap": false,
          "icon-allow-overlap": true,
          "text-field": ["get", withLanguageSuffix("name")],
          "text-optional": true,
          "text-size": 10,
          "text-max-width": 16,
          "text-offset": [0, 1.5],
        },
        paint: {
          "text-color": "#000000",
          "icon-color": "#FFFFFF",
          "text-halo-color": "#FFFFFF",
          "text-halo-width": 1,
        },
      },
      {
        id: "buildings-detail-alt-label",
        type: "symbol",
        source: UEC_MAP_SOURCE_ID,
        "source-layer": "buildings_label",
        filter: ["==", ["get", "type"], "utility"],
        minzoom: ZOOM_LEVELS.ALL_BUILDINGS,
        maxzoom: ZOOM_LEVELS.BUILDING_DETAILS,
        layout: {
          "text-padding": 0,
          "text-field": ["get", withLanguageSuffix("altname")],
          "text-optional": true,
          "text-size": 10,
          "text-anchor": "top",
          "text-offset": [0, 2],
        },
        paint: {
          "text-color": "#000000",
          "text-halo-color": "#FFFFFF",
          "text-halo-width": 1,
        },
      },
    ];
  },
);
