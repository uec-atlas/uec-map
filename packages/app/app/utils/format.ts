export const formatFloorNumber = (floor: number): string => {
  if (floor < 0) return `B${-floor}F`;
  return `${floor}F`;
};
