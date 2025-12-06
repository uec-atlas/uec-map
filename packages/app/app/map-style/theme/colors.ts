export const TYPE_COLOR_MAP: Record<string, string> = {
  misc: "#969696",
  corridor: "#EAEAEA",
  elevator: "#C8C8C8",
  stairs: "#C8C8C8",
  lecture_room: "#D3F1FF",
  wc_universal: "#AC8DCE",
  wc_unknown: "#C7A3C6",
  wc_men: "#8DA2DB",
  wc_women: "#CE8D9B",
  common_space: "#FFEBA6",
  office: "#B1E4B2",
};

export const BUILDING_AREA_COLOR: Record<string, string> = {
  east: "#4eb562",
  west: "#f66950",
  "100th": "#43acdd",
};

export const BUILDING_TYPE_ICON_COLOR: Record<string, string> = {
  academic: "#1895d4",
  office: "#29b90c",
  community: "#ffbb00",
  residential: "#9126c7",
};

export const FLOOR_ICON_BG_COLOR: Record<string, string> = {
  lecture_room: "#3abdf9",
  wc_universal: "#8737dc",
  wc_unknown: "#9527b1",
  wc_men: "#234ec7",
  wc_women: "#c72347",
  common_space: "#f7c71c",
  office: "#0ca70e",
};

// Dark-mode variants
export const DARK_TYPE_COLOR_MAP: Record<string, string> = {
  misc: "#4a4a4a",
  corridor: "#555555",
  elevator: "#656565",
  stairs: "#656565",
  lecture_room: "#2f5270",
  wc_universal: "#6b4a75",
  wc_unknown: "#6b4766",
  wc_men: "#3a5f88",
  wc_women: "#8a3f46",
  common_space: "#7a6a10",
  office: "#2f5035",
};

export const DARK_BUILDING_AREA_COLOR: Record<string, string> = {
  east: "#2b5d3a",
  west: "#7a3b33",
  "100th": "#2e6580",
};

export const DARK_BUILDING_TYPE_ICON_COLOR: Record<string, string> = {
  academic: "#0f5f86",
  office: "#1b7a08",
  community: "#a67f00",
  residential: "#6b2ea8",
};

export const DARK_FLOOR_ICON_BG_COLOR: Record<string, string> = {
  lecture_room: "#0f6fa0",
  wc_universal: "#5b2fa0",
  wc_unknown: "#6a2a86",
  wc_men: "#12345f",
  wc_women: "#8a1b2b",
  common_space: "#8b6b16",
  office: "#0b5a08",
};

export type ColorMode = "light" | "dark";

export function getTypeColorMap(mode: ColorMode) {
  return mode === "dark" ? DARK_TYPE_COLOR_MAP : TYPE_COLOR_MAP;
}

export function getBuildingAreaColor(mode: ColorMode) {
  return mode === "dark" ? DARK_BUILDING_AREA_COLOR : BUILDING_AREA_COLOR;
}

export function getBuildingTypeIconColor(mode: ColorMode) {
  return mode === "dark"
    ? DARK_BUILDING_TYPE_ICON_COLOR
    : BUILDING_TYPE_ICON_COLOR;
}

export function getFloorIconBgColor(mode: ColorMode) {
  return mode === "dark" ? DARK_FLOOR_ICON_BG_COLOR : FLOOR_ICON_BG_COLOR;
}
