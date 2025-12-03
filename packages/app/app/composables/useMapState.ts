import type { LngLatLike, PaddingOptions } from "maplibre-gl";

interface SelectedObjectBase {
  type: string;
  id: string;
  properties: Record<string, unknown>;
  coordinates: [number, number];
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
  userLocation: computed(() =>
    userLocation.locatedAt.value
      ? ([
          userLocation.coords.value.longitude,
          userLocation.coords.value.latitude,
        ] as [number, number])
      : null,
  ),
  padding: ref<PaddingOptions>({ top: 0, bottom: 0, left: 0, right: 0 }),
  jumpTo(options: {
    center: LngLatLike;
    zoom?: number;
    pitch?: number;
    padding?: PaddingOptions;
  }) {
    this.map.value?.easeTo({
      center: options.center,
      zoom: options.zoom ?? this.zoom.value,
      pitch: options.pitch ?? this.pitch.value,
      padding: options.padding ?? this.padding.value,
    });
  },
};

export const useMapState = () => mapState;
