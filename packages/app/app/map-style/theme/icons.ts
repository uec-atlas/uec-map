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
