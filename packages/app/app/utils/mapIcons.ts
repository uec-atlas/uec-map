import RawCheckbook from "~icons/material-symbols/checkbook?raw";
import RawCoPresent from "~icons/material-symbols/co-present?raw";
import RawDomain from "~icons/material-symbols/domain?raw";
import RawElevator from "~icons/material-symbols/elevator-outline?raw";
import RawFountain from "~icons/mdi/fountain?raw";
import RawGate from "~icons/material-symbols/gate?raw";
import RawGroups from "~icons/material-symbols/groups?raw";
import RawHome from "~icons/material-symbols/home?raw";
import RawMan from "~icons/material-symbols/man?raw";
import RawRoomPreferences from "~icons/material-symbols/room-preferences?raw";
import RawWoman from "~icons/material-symbols/woman?raw";
import RawStairs from "~icons/material-symbols/stairs-2?raw";
import RawSquare from "~icons/material-symbols/square?raw";
import RawTownHall from "~icons/mdi/town-hall?raw";
import RawTriangle from "~icons/mdi/triangle?raw";
import RawToilet from "~icons/map/toilet?raw";

const mapIcons = {
  "material-symbols:checkbook": RawCheckbook,
  "material-symbols:co-present": RawCoPresent,
  "material-symbols:domain": RawDomain,
  "material-symbols:elevator-outline": RawElevator,
  "mdi:fountain": RawFountain,
  "material-symbols:gate": RawGate,
  "material-symbols:groups": RawGroups,
  "material-symbols:home": RawHome,
  "material-symbols:room-preferences": RawRoomPreferences,
  "material-symbols:stairs-2": RawStairs,
  "material-symbols:square": RawSquare,
  "mdi:town-hall": RawTownHall,
  "mdi:triangle": RawTriangle,
  "material-symbols:woman": RawWoman,
  "material-symbols:man": RawMan,
  "map:toilet": RawToilet,
} as const;

export const MAP_ICONS = Object.fromEntries(
  Object.keys(mapIcons).map((key) => [key, key]),
) as { [K in keyof typeof mapIcons]: K };

function loadSvgImage(svgString: string): Promise<HTMLImageElement> {
  if (!svgString.includes('xmlns="http://www.w3.org/2000/svg"')) {
    svgString = svgString.replace(
      "<svg ",
      '<svg xmlns="http://www.w3.org/2000/svg" ',
    );
  }
  return new Promise((resolve, reject) => {
    const img = new Image(24, 24);
    const svgBlob = new Blob([svgString], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(svgBlob);
    img.src = url;
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (e) => {
      console.error("Failed to load SVG image", e);
      URL.revokeObjectURL(url);
      reject(e);
    };
  });
}

export async function loadMapIcons(map: maplibregl.Map) {
  const loadPromises = Object.entries(mapIcons).map(
    async ([iconName, svgString]) =>
      [iconName, await loadSvgImage(svgString)] as const,
  );
  const icons = await Promise.all(loadPromises);

  for (const [iconName, image] of icons) {
    if (!map.hasImage(iconName)) {
      map.addImage(iconName, image, { sdf: true });
    }
  }
}
