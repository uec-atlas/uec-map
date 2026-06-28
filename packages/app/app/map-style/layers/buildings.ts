import { UEC_MAP_SOURCE_ID } from "@uec-atlas/uec-map-sdk";
import type { ExpressionSpecification, LayerSpecification } from "maplibre-gl";
import {
  getBuildingAreaColor,
  getBuildingTypeIconColor,
  type ColorMode,
} from "../theme/colors";
import {
  BUILDING_ICONS,
  largeIcon,
  largeIconScale,
  largeLabel,
  overlap,
  scaledSmallIconScale,
  smallIcon,
  smallLabel,
} from "../theme/icons";
import { ZOOM_LEVELS } from "../theme/zoom";
import { buildMatch } from "../utils/expressions";
import { altNameField, nameField } from "../utils/lang";
import { defineLayerFactory } from "../utils/layer";

const buildingFilter = [
  "in",
  ["get", "type"],
  ["literal", ["Building", "Structure"]],
] as const satisfies ExpressionSpecification;

export const createBuildingLayers = defineLayerFactory((mode: ColorMode) => ({
  id: "buildings",
  type: "fill",
  source: UEC_MAP_SOURCE_ID,
  filter: buildingFilter,
  minzoom: 0,
  paint: {
    "fill-color": buildMatch(
      "containedInPlace",
      getBuildingAreaColor(mode),
      "#969696",
    ),
    "fill-opacity": [
      "step",
      ["zoom"],
      [
        "case",
        ["==", ["get", "category"], "utility"],
        0.5,
        ["==", ["get", "type"], "Structure"],
        0.5,
        1,
      ],
      ZOOM_LEVELS.BUILDING_DETAILS,
      0.2,
    ],
  },
}));

export const createBuildingIconLayers = defineLayerFactory(
  (
    language: string,
    mode: ColorMode,
    isDesktop = true,
  ): LayerSpecification[] => {
    const BUILDING_TYPE = getBuildingTypeIconColor(mode);

    return [
      {
        id: "buildings-icon-shadow",
        type: "circle",
        source: "buildingCentroids",
        filter: ["!=", ["get", "category"], "utility"],
        minzoom: ZOOM_LEVELS.MAIN_BUILDING,
        maxzoom: ZOOM_LEVELS.BUILDING_DETAILS,
        paint: {
          "circle-radius": largeIcon(isDesktop),
          "circle-blur": 0.7,
          "circle-color": "#000000AA",
          "circle-translate": [0, 2],
        },
      },
      {
        id: "buildings-icon-background",
        type: "circle",
        source: "buildingCentroids",
        filter: ["!=", ["get", "category"], "utility"],
        minzoom: ZOOM_LEVELS.MAIN_BUILDING,
        maxzoom: ZOOM_LEVELS.BUILDING_DETAILS,
        paint: {
          "circle-radius": largeIcon(isDesktop),
          "circle-color": buildMatch("category", BUILDING_TYPE, "#969696"),
          "circle-stroke-color": mode === "dark" ? "#CCCCCC" : "#FFFFFF",
          "circle-stroke-width": 2,
        },
      },
      {
        id: "buildings-icon-symbol",
        type: "symbol",
        source: "buildingCentroids",
        filter: ["!=", ["get", "category"], "utility"],
        minzoom: ZOOM_LEVELS.MAIN_BUILDING,
        maxzoom: ZOOM_LEVELS.BUILDING_DETAILS,
        layout: {
          "icon-image": buildMatch(
            "category",
            BUILDING_ICONS,
            BUILDING_ICONS.default,
          ),
          "icon-padding": 0,
          "icon-allow-overlap": true,
          "icon-ignore-placement": true,
          "icon-size": largeIconScale(isDesktop),
          "icon-optional": false,
        },
        paint: {
          "icon-color": "#FFFFFF",
        },
      },
      {
        id: "buildings-text-symbol",
        type: "symbol",
        source: "buildingCentroids",
        filter: ["!=", ["get", "category"], "utility"],
        minzoom: ZOOM_LEVELS.MAIN_BUILDING,
        maxzoom: ZOOM_LEVELS.BUILDING_DETAILS,
        layout: {
          "text-field": nameField(language),
          "text-optional": false,
          "text-size": largeLabel(isDesktop),
          "text-max-width": 16,
          "text-offset": [0, 2],
          "text-allow-overlap": overlap(),
          "text-padding": 0,
        },
        paint: {
          "text-color": mode === "dark" ? "#FFFFFF" : "#000000",
          "text-halo-color": mode === "dark" ? "#000000" : "#FFFFFF",
          "text-halo-width": 2,
        },
      },
      {
        id: "buildings-alt-text",
        type: "symbol",
        source: "buildingCentroids",
        filter: ["!=", ["get", "category"], "utility"],
        minzoom: ZOOM_LEVELS.ALL_BUILDINGS,
        maxzoom: ZOOM_LEVELS.BUILDING_DETAILS,
        layout: {
          "text-padding": 0,
          "text-field": altNameField(language),
          "text-size": smallLabel(isDesktop),
          "text-anchor": "top",
          "text-allow-overlap": overlap(),
          "text-offset": [0, 3.125],
        },
        paint: {
          "text-color": mode === "dark" ? "#FFFFFF" : "#000000",
          "text-halo-color": mode === "dark" ? "#000000" : "#FFFFFF",
          "text-halo-width": 2,
        },
      },
    ] as unknown as LayerSpecification[];
  },
);

export const createBuildingDetailIconLayers = defineLayerFactory(
  (
    language: string,
    mode: ColorMode,
    isDesktop = true,
  ): LayerSpecification[] => {
    return [
      {
        id: "buildings-detail-icon-shadow",
        type: "circle",
        source: "buildingCentroids",
        filter: ["==", ["get", "type"], "utility"],
        minzoom: ZOOM_LEVELS.ALL_BUILDINGS,
        maxzoom: ZOOM_LEVELS.BUILDING_DETAILS,
        paint: {
          "circle-radius": smallIcon(isDesktop),
          "circle-blur": 0.7,
          "circle-color": "#000000AA",
          "circle-translate": [0, 2],
        },
      },
      {
        id: "buildings-detail-icon-background",
        type: "circle",
        source: "buildingCentroids",
        filter: ["==", ["get", "type"], "utility"],
        minzoom: ZOOM_LEVELS.ALL_BUILDINGS,
        maxzoom: ZOOM_LEVELS.BUILDING_DETAILS,
        paint: {
          "circle-radius": smallIcon(isDesktop),
          "circle-color": "#969696",
          "circle-stroke-color": mode === "dark" ? "#CCCCCC" : "#FFFFFF",
          "circle-stroke-width": 2,
        },
      },
      {
        id: "buildings-detail-icon",
        type: "symbol",
        source: "buildingCentroids",
        filter: ["==", ["get", "type"], "utility"],
        minzoom: ZOOM_LEVELS.ALL_BUILDINGS,
        maxzoom: ZOOM_LEVELS.BUILDING_DETAILS,
        layout: {
          "icon-image": MAP_ICONS["material-symbols:room-preferences"],
          "icon-size": scaledSmallIconScale(isDesktop, 0.7),
          "icon-optional": false,
          "icon-ignore-placement": true,
          "icon-padding": 0,
          "icon-allow-overlap": true,
        },
        paint: {
          "icon-color": "#FFFFFF",
        },
      },
      {
        id: "buildings-detail-text",
        type: "symbol",
        source: "buildingCentroids",
        filter: ["==", ["get", "type"], "utility"],
        minzoom: ZOOM_LEVELS.ALL_BUILDINGS,
        maxzoom: ZOOM_LEVELS.BUILDING_DETAILS,
        layout: {
          "text-field": nameField(language),
          "text-optional": true,
          "text-size": smallLabel(isDesktop),
          "text-max-width": 16,
          "text-anchor": "top",
          "text-allow-overlap": overlap(),
          "text-offset": [0, 1.675],
          "text-padding": 0,
        },
        paint: {
          "text-color": mode === "dark" ? "#FFFFFF" : "#000000",
          "text-halo-color": mode === "dark" ? "#000000" : "#FFFFFF",
          "text-halo-width": 1,
        },
      },
      // detail alt text
      {
        id: "buildings-detail-alt-text",
        type: "symbol",
        source: "buildingCentroids",
        filter: ["==", ["get", "type"], "utility"],
        minzoom: ZOOM_LEVELS.ALL_BUILDINGS,
        maxzoom: ZOOM_LEVELS.BUILDING_DETAILS,
        layout: {
          "text-padding": 0,
          "text-field": altNameField(language),
          "text-optional": true,
          "text-size": smallLabel(isDesktop),
          "text-anchor": "top",
          "text-allow-overlap": overlap(),
          "text-offset": [0, 3],
        },
        paint: {
          "text-color": mode === "dark" ? "#FFFFFF" : "#000000",
          "text-halo-color": mode === "dark" ? "#000000" : "#FFFFFF",
          "text-halo-width": 1,
        },
      },
    ] as unknown as LayerSpecification[];
  },
);
