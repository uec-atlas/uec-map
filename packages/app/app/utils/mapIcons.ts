import RawCheckbook from "~icons/material-symbols/checkbook?raw";
import RawElevator from "~icons/material-symbols/elevator-outline?raw";
import RawFemale from "~icons/map/female?raw";
import RawMale from "~icons/map/male?raw";
import RawSchool from "~icons/map/school?raw";
import RawSourceEnvironment from "~icons/material-symbols/source-environment?raw";
import RawStairs from "~icons/material-symbols/stairs-2?raw";
import RawToilet from "~icons/map/toilet?raw";

const mapIcons = {
  "material-symbols:checkbook": RawCheckbook,
  "material-symbols:elevator-outline": RawElevator,
  "material-symbols:stairs-2": RawStairs,
  "material-symbols:source-environment": RawSourceEnvironment,
  "map:female": RawFemale,
  "map:male": RawMale,
  "map:school": RawSchool,
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
