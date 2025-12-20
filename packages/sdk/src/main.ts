import maplibregl, {
  type SourceSpecification,
  type StyleSpecification,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import * as pmtiles from "pmtiles";
import bundledPMTiles from "./assets/map.pmtiles?inline";

export const UEC_MAP_SOURCE_ID = "uec-map";

const dataURItoBlob = (dataURI: string) => {
  const [header, data] = dataURI.split(",");
  const byteString = atob(data);
  const mimeString = header.split(":")[1].split(";")[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeString });
};

let cachedBundledPMTilesUrl: string | undefined;
export function getBundledPMTilesUrl() {
  if (cachedBundledPMTilesUrl) return cachedBundledPMTilesUrl;
  cachedBundledPMTilesUrl = bundledPMTiles.startsWith("data:")
    ? URL.createObjectURL(dataURItoBlob(bundledPMTiles))
    : bundledPMTiles;
  return cachedBundledPMTilesUrl;
}

export function setupTiles(lib: typeof maplibregl = maplibregl) {
  const protocol = new pmtiles.Protocol();
  lib.addProtocol("pmtiles", protocol.tile);
  return protocol;
}

export function buildMapStyle(
  pmtilesUrl: string,
  userStyle?: StyleSpecification,
): StyleSpecification {
  const pmtilesSource: SourceSpecification = {
    type: "vector",
    url: `pmtiles://${pmtilesUrl}`,
    attribution: "&copy; e-chan1007",
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
  return {
    ...userStyle,
    sources: {
      ...userStyle.sources,
      [UEC_MAP_SOURCE_ID]: pmtilesSource,
    },
  };
}

export interface EmbedMapOptions extends Omit<maplibregl.MapOptions, "style"> {
  pmtilesUrl: string;
  style?: StyleSpecification;
}

export class EmbedMap {
  public map: maplibregl.Map;
  private pmtilesUrl: string;

  constructor(options: EmbedMapOptions) {
    setupTiles(maplibregl);

    const { pmtilesUrl, style: userStyle, ...mapOptions } = options;
    this.pmtilesUrl = pmtilesUrl;
    const style = buildMapStyle(pmtilesUrl, userStyle);

    this.map = new maplibregl.Map({
      ...mapOptions,
      style: style,
      center: mapOptions.center || [139.7, 35.6],
      zoom: mapOptions.zoom || 10,
    });
  }

  public setStyle(userStyle?: StyleSpecification, pmtilesUrl?: string) {
    if (pmtilesUrl) {
      this.pmtilesUrl = pmtilesUrl;
    }
    const style = buildMapStyle(this.pmtilesUrl, userStyle);
    this.map.setStyle(style);
  }
}
