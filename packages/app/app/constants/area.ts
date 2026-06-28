export const AREA_ID_MAP = {
  east: "uar:spatial/EFIV3IVM",
  west: "uar:spatial/KNT63TOW",
  anniversary: "uar:spatial/SKOL7UDT",
} as const satisfies Record<string, string>;

export type AreaKey = keyof typeof AREA_ID_MAP;
