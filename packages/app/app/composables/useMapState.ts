import type { LngLatLike, PaddingOptions } from "maplibre-gl";
import type { PlaceInputValue } from "~/components/PlaceInput.vue";

interface SelectedObjectBase {
  type: string;
  id: string;
  properties: Record<string, unknown>;
  coordinate: [number, number];
  geometry: GeoJSON.Geometry;
}

interface SelectedBuilding extends SelectedObjectBase {
  type: "building";
}

interface SelectedGate extends SelectedObjectBase {
  type: "gate";
}

interface SelectedRoom extends SelectedObjectBase {
  type: "room";
  building: {
    id: string;
    properties: Record<string, unknown>;
    coordinate: [number, number];
  };
}

export type SelectedObject = SelectedBuilding | SelectedGate | SelectedRoom;

export const MAP_INITIAL_CENTER = [139.5425, 35.657] as LngLatLike;
const userLocation = useGeolocation({
  enableHighAccuracy: true,
  maximumAge: 0,
  timeout: Infinity,
});
const mapState = {
  map: ref<maplibregl.Map>(),
  floor: ref(1),
  zoom: ref(15),
  pitch: ref(0),
  center: ref(MAP_INITIAL_CENTER as [number, number]),
  selectedObject: ref(null) as Ref<SelectedObject | null>,
  pathFindTo: ref<PlaceInputValue | null>(null),
  userLocation: computed(() =>
    userLocation.locatedAt.value
      ? ([
          userLocation.coords.value.longitude,
          userLocation.coords.value.latitude,
        ] as [number, number])
      : null,
  ),
  padding: ref<PaddingOptions>({ top: 64, bottom: 0, left: 0, right: 0 }),
  jumpTo(options: {
    center: LngLatLike;
    zoom?: number;
    pitch?: number;
    padding?: PaddingOptions;
  }) {
    // ドロワーのアニメーションが完了するのを待つため、遅延実行
    nextTick(() => {
        this.map.value?.easeTo({
          center: options.center,
          zoom: options.zoom ?? this.zoom.value,
          pitch: options.pitch ?? this.pitch.value,
          padding: options.padding ?? this.padding.value,
        });
    });
  },
  pathFindResult: ref<GeoJSON.Feature | null>(null),
};

export const useMapState = () => mapState;
