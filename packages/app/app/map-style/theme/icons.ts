import type { ExpressionSpecification } from "maplibre-gl";

export const BUILDING_ICONS = {
  academic: MAP_ICONS["mdi:town-hall"],
  sports: MAP_ICONS["material-symbols:emoji-people"],
  office: MAP_ICONS["material-symbols:checkbook"],
  residential: MAP_ICONS["material-symbols:home"],
  welfare: MAP_ICONS["material-symbols:groups"],
  security: MAP_ICONS["material-symbols:security"],
  monument: MAP_ICONS["mdi:triangle"],
  parking: MAP_ICONS["material-symbols:local-parking"],
  utility: MAP_ICONS["material-symbols:room-preferences"],
  water: MAP_ICONS["mdi:fountain"],
  default: MAP_ICONS["material-symbols:square"],
} as const satisfies Record<string, string>;

export const FLOOR_ICON_SPEC: ExpressionSpecification = [
  "case",
  ["in", ["get", "type"], ["literal", ["Classroom", "PracticeRoom"]]],
  [
    "match",
    ["get", "category"],
    "computer",
    MAP_ICONS["material-symbols:desktop-windows-outline"],
    "science",
    MAP_ICONS["material-symbols:science"],
    "engineering",
    MAP_ICONS["material-symbols:tools-wrench"],
    MAP_ICONS["material-symbols:co-present"],
  ],
  [
    "all",
    ["==", ["get", "type"], "Passage"],
    ["in", ["get", "category"], ["literal", ["elevator"]]],
  ],
  MAP_ICONS["material-symbols:elevator-outline"],
  [
    "all",
    ["==", ["get", "type"], "Passage"],
    ["in", ["get", "category"], ["literal", ["stairs"]]],
  ],
  MAP_ICONS["material-symbols:stairs-2"],
  ["==", ["get", "type"], "Restroom"],
  [
    "case",
    ["==", ["get", "gender"], "men"],
    MAP_ICONS["material-symbols:man"],
    ["==", ["get", "gender"], "women"],
    MAP_ICONS["material-symbols:woman"],
    ["==", ["get", "amenity:wheelchair_accessible"], true],
    MAP_ICONS["mdi:wheelchair"],
    MAP_ICONS["map:toilet"],
  ],
  ["==", ["get", "type"], "Facility"],
  [
    "match",
    ["get", "category"],
    "cafeteria",
    MAP_ICONS["mdi:silverware-fork-knife"],
    "shop",
    MAP_ICONS["mdi:shopping"],
    "office",
    MAP_ICONS["material-symbols:checkbook"],
    MAP_ICONS["mdi:town-hall"],
  ],
  ["in", ["get", "type"], ["literal", ["Room", "RoomSubZone"]]],
  [
    "match",
    ["get", "usage"],
    "library",
    MAP_ICONS["mdi:bookshelf"],
    "museum",
    MAP_ICONS["material-symbols:account-balance"],
    "group_study",
    MAP_ICONS["material-symbols:groups"],
    "self_study",
    MAP_ICONS["material-symbols:person"],
    "extra_curricular",
    MAP_ICONS["material-symbols:emoji-people"],
    "lounge",
    MAP_ICONS["material-symbols:emoji-people"],
    MAP_ICONS["material-symbols:square"],
  ],
  MAP_ICONS["material-symbols:square"],
];

import { ZOOM_LEVELS } from "../theme/zoom";

const ICON_RADIUS_SMALL = 14;
const ICON_RADIUS_LARGE = 18;

const MOBILE_SIZE_ADJUSTMENT = -2;
const MIN_BASE = 8;

function adjustForDesktop(baseVal: number, isDesktop: boolean) {
  return Math.max(MIN_BASE, baseVal + (isDesktop ? 0 : MOBILE_SIZE_ADJUSTMENT));
}

const ICON_IMAGE_BASE = 24;
const ICON_VISUAL_SCALE = 0.8;

function iconScale(baseVal: number, isDesktop: boolean) {
  const base = adjustForDesktop(baseVal, isDesktop);
  const scale = ((base * 2) / ICON_IMAGE_BASE) * ICON_VISUAL_SCALE;
  return scale;
}

export function overlap() {
  return ["step", ["zoom"], false, ZOOM_LEVELS.BUILDING_DETAILS, true] as const;
}

const LABEL_SMALL = 13;
const LABEL_LARGE = 15;

export function largeLabel(isDesktop: boolean) {
  return adjustForDesktop(LABEL_LARGE, isDesktop);
}

export function smallLabel(isDesktop: boolean) {
  return adjustForDesktop(LABEL_SMALL, isDesktop);
}

export function largeIcon(isDesktop: boolean) {
  return adjustForDesktop(ICON_RADIUS_LARGE, isDesktop);
}

export function smallIcon(isDesktop: boolean) {
  return adjustForDesktop(ICON_RADIUS_SMALL, isDesktop);
}

export function largeIconScale(isDesktop: boolean) {
  return iconScale(ICON_RADIUS_LARGE, isDesktop);
}

export function smallIconScale(isDesktop: boolean) {
  return iconScale(ICON_RADIUS_SMALL, isDesktop);
}

export function scaledSmallIconScale(isDesktop: boolean, factor: number) {
  const base = adjustForDesktop(ICON_RADIUS_SMALL, isDesktop);
  const scale = ((base * 2) / ICON_IMAGE_BASE) * ICON_VISUAL_SCALE * factor;
  return scale;
}
