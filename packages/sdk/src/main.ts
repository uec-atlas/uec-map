import maplibregl, {
  type SourceSpecification,
  type StyleSpecification,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export const UEC_MAP_SOURCE_ID = "uec-map";
export const UEC_ATLAS_SPATIAL_URL =
  "https://uec-atlas.org/resources/spatial/all";

let cachedUECAtlasSpatial: GeoJSON.FeatureCollection | null = null;

export async function getUECAtlasSpatial(): Promise<GeoJSON.FeatureCollection> {
  if (cachedUECAtlasSpatial) {
    return cachedUECAtlasSpatial;
  }
  const data = await fetch(UEC_ATLAS_SPATIAL_URL).then((res) => res.json());
  cachedUECAtlasSpatial = data;
  return data;
}

export function buildMapStyle(
  spatialData?: GeoJSON.FeatureCollection,
  userStyle?: StyleSpecification,
): StyleSpecification {
  const source: SourceSpecification = {
    type: "geojson",
    data: spatialData || UEC_ATLAS_SPATIAL_URL,
    attribution: "&copy; <a href='https://uec-atlas.org'>UEC Atlas</a>",
  };

  if (!userStyle) {
    return {
      version: 8,
      sources: {
        [UEC_MAP_SOURCE_ID]: source,
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
      [UEC_MAP_SOURCE_ID]: source,
    },
  };
}

export interface EmbedMapOptions extends Omit<maplibregl.MapOptions, "style"> {
  data?: GeoJSON.FeatureCollection;
  style?: StyleSpecification;
}

export class EmbedMap {
  public data?: GeoJSON.FeatureCollection;
  public map: maplibregl.Map;

  constructor(options: EmbedMapOptions) {
    const { data, style: userStyle, ...mapOptions } = options;
    const style = buildMapStyle(data, userStyle);

    this.data = data;
    this.map = new maplibregl.Map({
      ...mapOptions,
      style: style,
      center: mapOptions.center || [139.7, 35.6],
      zoom: mapOptions.zoom || 10,
    });
  }

  public setStyle(userStyle?: StyleSpecification) {
    const style = buildMapStyle(this.data, userStyle);
    this.map.setStyle(style);
  }
}
