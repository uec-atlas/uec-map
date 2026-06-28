import { UEC_MAP_SOURCE_ID } from "@uec-atlas/uec-map-sdk";
import type {
  ExpressionSpecification,
  FilterSpecification,
  LayerSpecification,
} from "maplibre-gl";
import {
  getFillColorSpec,
  getFloorIconBgSpec,
  type ColorMode,
} from "../theme/colors";
import {
  FLOOR_ICON_SPEC,
  smallIcon,
  smallIconScale,
  smallLabel,
} from "../theme/icons";
import { ZOOM_LEVELS } from "../theme/zoom";
import { altNameField, nameField } from "../utils/lang";
import { defineLayerFactory } from "../utils/layer";

export const createFloorLayers = defineLayerFactory(
  (floor: FloorLevel, shouldUseExtrusion: boolean, mode: ColorMode) => {
    const { typeMap } = useSpatialEntries();
    const currentStoreyIds = typeMap.value.Storey.filter(
      (storey) => storey.properties.floorLevel === floor.label,
    ).map((storey) => storey.id);

    return [
      {
        id: "floors",
        type: "fill",
        source: UEC_MAP_SOURCE_ID,
        minzoom: ZOOM_LEVELS.BUILDING_DETAILS,
        filter: [
          "any",
          ...currentStoreyIds.map(
            (id) =>
              [
                "in",
                id,
                ["array", ["get", "ancestors"]],
              ] as ExpressionSpecification,
          ),
          ...currentStoreyIds.map(
            (id) =>
              [
                "in",
                id,
                ["array", ["get", "intersectsPlace"]],
              ] as ExpressionSpecification,
          ),
        ],
        layout: { visibility: shouldUseExtrusion ? "none" : "visible" },
        paint: {
          "fill-color": getFillColorSpec(mode),
          "fill-outline-color": "#232323",
        },
      },
    ];
  },
);

export const createFloorIconLayers = defineLayerFactory(
  (
    floor: FloorLevel,
    shouldUseExtrusion: boolean,
    language: string,
    mode: ColorMode,
    isDesktop = true,
  ): LayerSpecification[] => {
    const { typeMap } = useSpatialEntries();
    const currentStoreyIds = typeMap.value.Storey.filter(
      (storey) => storey.properties.floorLevel === floor.label,
    ).map((storey) => storey.id);

    const FLOOR_BG = getFloorIconBgSpec(mode);

    const floorIconFilter: FilterSpecification = [
      "all",
      [
        "any",
        ...currentStoreyIds.map(
          (id) =>
            [
              "in",
              id,
              ["array", ["get", "ancestors"]],
            ] as ExpressionSpecification,
        ),
        ...currentStoreyIds.map(
          (id) =>
            [
              "in",
              id,
              ["array", ["get", "intersectsPlace"]],
            ] as ExpressionSpecification,
        ),
      ],
      [
        "!",
        [
          "all",
          ["in", ["get", "type"], ["literal", ["Room", "RoomSubZone"]]],
          ["!", ["has", "usage"]],
        ],
      ],
      [
        "!",
        [
          "all",
          ["==", ["get", "type"], "Passage"],
          ["==", ["get", "category"], "corridor"],
        ],
      ],
    ];

    const floorIconLabelFilter: FilterSpecification = [
      ...floorIconFilter,
      ["!=", ["get", "type"], "Passage"],
    ];

    return [
      {
        id: "floors-icon-shadow",
        type: "circle",
        source: "floorCentroids",
        minzoom: ZOOM_LEVELS.BUILDING_DETAILS,
        filter: floorIconFilter,
        layout: { visibility: shouldUseExtrusion ? "none" : "visible" },
        paint: {
          "circle-radius": smallIcon(isDesktop) + 2,
          "circle-blur": 0.7,
          "circle-color": "#000000AA",
          "circle-translate": [0, 2],
        },
      },
      {
        id: "floors-icon-background",
        type: "circle",
        source: "floorCentroids",
        minzoom: ZOOM_LEVELS.BUILDING_DETAILS,
        filter: floorIconFilter,
        layout: { visibility: shouldUseExtrusion ? "none" : "visible" },
        paint: {
          "circle-radius": smallIcon(isDesktop) + 2,
          "circle-color": FLOOR_BG,
          "circle-stroke-color": mode === "dark" ? "#CCCCCC" : "#FFFFFF",
          "circle-stroke-width": 2,
        },
      },
      {
        id: "floors-text-symbol",
        type: "symbol",
        source: "floorCentroids",
        minzoom: ZOOM_LEVELS.BUILDING_DETAILS,
        filter: floorIconLabelFilter,
        layout: {
          visibility: shouldUseExtrusion ? "none" : "visible",
          "text-padding": 0,
          "text-field": nameField(language),
          "text-size": smallLabel(isDesktop),
          "text-max-width": 16,
          "text-offset": [0, 2],
          "text-allow-overlap": false,
        },
        paint: {
          "text-color": mode === "dark" ? "#FFFFFF" : "#000000",
          "text-halo-color": mode === "dark" ? "#000000" : "#FFFFFF",
          "text-halo-width": 1,
        },
      },
      {
        id: "floors-alt-label",
        type: "symbol",
        source: "floorCentroids",
        minzoom: ZOOM_LEVELS.BUILDING_DETAILS,
        filter: floorIconLabelFilter,
        layout: {
          visibility: shouldUseExtrusion ? "none" : "visible",
          "text-padding": 0,
          "text-field": altNameField(language),
          "text-size": smallLabel(isDesktop),
          "text-anchor": "top",
          "text-offset": [0, 2.75],
          "text-allow-overlap": false,
        },
        paint: {
          "text-color": mode === "dark" ? "#FFFFFF" : "#000000",
          "text-halo-color": mode === "dark" ? "#000000" : "#FFFFFF",
          "text-halo-width": 1,
        },
      },
      {
        id: "floors-icon-symbol",
        type: "symbol",
        source: "floorCentroids",
        minzoom: ZOOM_LEVELS.BUILDING_DETAILS,
        filter: floorIconFilter,
        layout: {
          visibility: shouldUseExtrusion ? "none" : "visible",
          "icon-image": FLOOR_ICON_SPEC,
          "icon-size": smallIconScale(isDesktop),
          "icon-padding": 0,
          "icon-allow-overlap": true,
          "icon-ignore-placement": false,
          "icon-optional": false,
        },
        paint: {
          "icon-color": "#FFFFFF",
        },
      },
    ] as unknown as LayerSpecification[];
  },
);
