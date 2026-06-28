import type { ExpressionSpecification } from "maplibre-gl";

export const BUILDING_AREA_COLOR: Record<string, string> = {
  [AREA_ID_MAP.east]: "#4eb562",
  [AREA_ID_MAP.west]: "#f66950",
  [AREA_ID_MAP.anniversary]: "#43acdd",
};

export const BUILDING_CATEGORY_ICON_COLOR: Record<string, string> = {
  academic: "#29b90c",
  office: "#1895d4",
  sports: "#ffbb00",
  welfare: "#ffbb00",
  residential: "#9126c7",
};

export const FLOOR_ICON_BG_COLOR_SPEC: ExpressionSpecification = [
  "case",
  ["in", ["get", "type"], ["literal", ["Classroom", "PracticeRoom"]]],
  "#0ca70e",
  [
    "all",
    ["==", ["get", "type"], "Passage"],
    ["in", ["get", "category"], ["literal", ["elevator", "stairs"]]],
  ],
  "#969696",
  ["==", ["get", "type"], "Restroom"],
  ["match", ["get", "gender"], "men", "#234ec7", "women", "#c72347", "#9527b1"],
  ["==", ["get", "type"], "Facility"],
  [
    "match",
    ["get", "category"],
    "cafeteria",
    "#f7c71c",
    "shop",
    "#f7c71c",
    "office",
    "#3abdf9",
    "#969696",
  ],
  ["in", ["get", "type"], ["literal", ["Room", "RoomSubZone"]]],
  [
    "match",
    ["get", "usage"],
    "library",
    "#22a37a",
    "museum",
    "#2329ba",
    "group_study",
    "#20bdaf",
    "self_study",
    "#20bdaf",
    "extra_curricular",
    "#f7ad3b",
    "lounge",
    "#f7ad3b",
    "#969696",
  ],
  "#969696",
];

export const ROOM_COLOR_SPEC: ExpressionSpecification = [
  "case",
  ["in", ["get", "type"], ["literal", ["Classroom", "PracticeRoom"]]],
  "#B1E4B2",
  [
    "all",
    ["==", ["get", "type"], "Passage"],
    ["in", ["get", "category"], ["literal", ["elevator", "stairs"]]],
  ],
  "#C8C8C8",
  ["==", ["get", "type"], "Passage"],
  "#EAEAEA",
  ["==", ["get", "type"], "Restroom"],
  ["match", ["get", "gender"], "men", "#8DA2DB", "women", "#CE8D9B", "#AC8DCE"],
  ["==", ["get", "type"], "Facility"],
  [
    "match",
    ["get", "category"],
    "shop",
    "#fad284",
    "cafeteria",
    "#fad284",
    "office",
    "#84D4F9",
    "#969696",
  ],
  ["in", ["get", "type"], ["literal", ["Room", "RoomSubZone"]]],
  [
    "match",
    ["get", "usage"],
    "library",
    "#8adec3",
    "museum",
    "#c5c6ed",
    "group_study",
    "#9ee8e1",
    "self_study",
    "#9ee8e1",
    "extra_curricular",
    "#FFF6BC",
    "lounge",
    "#FFF6BC",
    "#969696",
  ],
  "#969696",
];

export const DARK_ROOM_COLOR_SPEC: ExpressionSpecification = [
  "case",
  ["in", ["get", "type"], ["literal", ["Classroom", "PracticeRoom"]]],
  "#2f5035",
  [
    "all",
    ["==", ["get", "type"], "Passage"],
    ["in", ["get", "category"], ["literal", ["elevator", "stairs"]]],
  ],
  "#656565",
  ["==", ["get", "type"], "Passage"],
  "#777777",
  ["==", ["get", "type"], "Restroom"],
  ["match", ["get", "gender"], "men", "#3a5f88", "women", "#8a3f46", "#6b4a75"],
  ["==", ["get", "type"], "Facility"],
  [
    "match",
    ["get", "category"],
    "shop",
    "#694b07",
    "cafeteria",
    "#694b07",
    "office",
    "#134c72",
    "#333333",
  ],
  ["in", ["get", "type"], ["literal", ["Room", "RoomSubZone"]]],
  [
    "match",
    ["get", "usage"],
    "library",
    "#1d4d3d",
    "museum",
    "#17195c",
    "group_study",
    "#165751",
    "self_study",
    "#165751",
    "extra_curricular",
    "#785f1c",
    "lounge",
    "#785f1c",
    "#333333",
  ],
  "#333333",
];

export const DARK_BUILDING_AREA_COLOR: Record<string, string> = {
  [AREA_ID_MAP.east]: "#2b5d3a",
  [AREA_ID_MAP.west]: "#7a3b33",
  [AREA_ID_MAP.anniversary]: "#2e6580",
};

export const DARK_BUILDING_CATEGORY_ICON_COLOR: Record<string, string> = {
  academic: "#1b7a08",
  office: "#0f5f86",
  sports: "#a67f00",
  welfare: "#a67f00",
  residential: "#6b2ea8",
};

export const DARK_FLOOR_ICON_BG_COLOR_SPEC: ExpressionSpecification = [
  "case",
  ["in", ["get", "type"], ["literal", ["Classroom", "PracticeRoom"]]],
  "#0b5a08",
  [
    "all",
    ["==", ["get", "type"], "Passage"],
    ["in", ["get", "category"], ["literal", ["elevator", "stairs"]]],
  ],
  "#4a4a4a",
  ["==", ["get", "type"], "Restroom"],
  ["match", ["get", "gender"], "men", "#12345f", "women", "#8a1b2b", "#6a2a86"],
  ["==", ["get", "type"], "Facility"],
  [
    "match",
    ["get", "category"],
    "cafeteria",
    "#8b6b16",
    "shop",
    "#8b6b16",
    "office",
    "#0f6fa0",
    "#4a4a4a",
  ],
  ["in", ["get", "type"], ["literal", ["Room", "RoomSubZone"]]],
  [
    "match",
    ["get", "usage"],
    "library",
    "#1d4d3d",
    "museum",
    "#17195c",
    "group_study",
    "#165751",
    "self_study",
    "#165751",
    "extra_curricular",
    "#785f1c",
    "lounge",
    "#785f1c",
    "#4a4a4a",
  ],
  "#4a4a4a",
];

export type ColorMode = "light" | "dark";

export function getFillColorSpec(mode: ColorMode) {
  return mode === "dark" ? DARK_ROOM_COLOR_SPEC : ROOM_COLOR_SPEC;
}

export function getBuildingAreaColor(mode: ColorMode) {
  return mode === "dark" ? DARK_BUILDING_AREA_COLOR : BUILDING_AREA_COLOR;
}

export function getBuildingTypeIconColor(mode: ColorMode) {
  return mode === "dark"
    ? DARK_BUILDING_CATEGORY_ICON_COLOR
    : BUILDING_CATEGORY_ICON_COLOR;
}

export function getFloorIconBgSpec(mode: ColorMode): ExpressionSpecification {
  return mode === "dark"
    ? DARK_FLOOR_ICON_BG_COLOR_SPEC
    : FLOOR_ICON_BG_COLOR_SPEC;
}
