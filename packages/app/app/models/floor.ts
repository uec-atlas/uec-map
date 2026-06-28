const parseFloorLevelString = (floorLevel: string): number => {
  const match = floorLevel.match(/^(B)?(\d+)$/);
  if (!match) {
    throw new Error(`Invalid floor level string: ${floorLevel}`);
  }
  const [, basement, level] = match;
  if (!level) {
    throw new Error(`Invalid floor level string: ${floorLevel}`);
  }
  return Number.parseInt(level, 10) * (basement ? -1 : 1);
};

export class FloorLevel {
  private floorLevel = 1;

  constructor(floorLevel: number | string) {
    if (typeof floorLevel === "string") {
      this.floorLevel = parseFloorLevelString(floorLevel);
    } else {
      this.floorLevel = floorLevel;
    }
  }

  get level(): number {
    return this.floorLevel;
  }

  set level(value: number) {
    this.floorLevel = value;
  }

  get label(): string {
    if (this.floorLevel < 0) {
      return `B${-this.floorLevel}`;
    }
    return `${this.floorLevel}`;
  }

  set label(value: string) {
    this.floorLevel = parseFloorLevelString(value);
  }

  get labelWithSuffix(): string {
    return `${this.label}F`;
  }

  set labelWithSuffix(value: string) {
    this.label = value.replace(/F$/, "");
  }
}
