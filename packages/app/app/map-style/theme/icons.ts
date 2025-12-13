export const FLOOR_ICONS = {
  elevator: MAP_ICONS["material-symbols:elevator-outline"],
  stairs: MAP_ICONS["material-symbols:stairs-2"],
  lecture_room: MAP_ICONS["material-symbols:co-present"],
  wc_universal: MAP_ICONS["map:toilet"],
  wc_unknown: MAP_ICONS["map:toilet"],
  wc_men: MAP_ICONS["material-symbols:man"],
  wc_women: MAP_ICONS["material-symbols:woman"],
  common_space: MAP_ICONS["material-symbols:groups"],
  office: MAP_ICONS["material-symbols:checkbook"],
  default: MAP_ICONS["mdi:town-hall"],
} as const satisfies Record<string, string>;

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
