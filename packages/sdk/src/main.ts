import maplibregl, {
  type SourceSpecification,
  type StyleSpecification,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import * as pmtiles from "pmtiles";
import bundledPMTiles from "./assets/map.pmtiles?inline";

export const UEC_MAP_SOURCE_ID = "uec-map";

function dataURItoBlob(dataURI: string) {
  const byteString = atob(dataURI.split(",")[1]);
  const mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  const blob = new Blob([ab], { type: mimeString });
  return blob;
}

const bundledPMTilesUrl = bundledPMTiles.startsWith("data:")
  ? URL.createObjectURL(dataURItoBlob(bundledPMTiles))
  : bundledPMTiles;

export function setupTiles(lib: typeof maplibregl = maplibregl) {
  const protocol = new pmtiles.Protocol();
  lib.addProtocol("pmtiles", protocol.tile);
  return protocol;
}

export function buildMapStyle(
  userStyle?: StyleSpecification,
): StyleSpecification {
  const pmtilesSource: SourceSpecification = {
    type: "vector",
    url: `pmtiles://${bundledPMTilesUrl}`,
    attribution: "(C) e-chan1007",
  };

  if (!userStyle) {
    return {
      version: 8,
      sources: {
        [UEC_MAP_SOURCE_ID]: pmtilesSource,
      },
      layers: [
        {
          id: "areas",
          type: "fill",
          source: UEC_MAP_SOURCE_ID,
          "source-layer": "areas",
          paint: { "fill-color": "#dddddd", "fill-outline-color": "#888888" },
        },
        {
          id: "simple-fill",
          type: "fill",
          source: UEC_MAP_SOURCE_ID,
          "source-layer": "buildings",
          paint: { "fill-color": "#888888" },
        },
      ],
    };
  }

  // 3. ユーザースタイルがある場合、そこにソースを注入して返す
  return {
    ...userStyle,
    sources: {
      ...userStyle.sources,
      [UEC_MAP_SOURCE_ID]: pmtilesSource,
    },
  };
}

export interface EmbedMapOptions extends maplibregl.MapOptions {
  style?: StyleSpecification;
}

export class EmbedMap {
  public map: maplibregl.Map;

  constructor(options: EmbedMapOptions) {
    setupTiles(maplibregl);

    const style = buildMapStyle(options.style);

    this.map = new maplibregl.Map({
      container: options.container,
      style: style,
      center: options.center || [139.7, 35.6],
      zoom: options.zoom || 10,
    });
  }

  public setStyle(userStyle: StyleSpecification) {
    const style = buildMapStyle(userStyle);
    this.map.setStyle(style);
  }
}
