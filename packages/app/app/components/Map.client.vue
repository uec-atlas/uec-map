<template>
  <div class="relative w-full h-full">
    <MglMap
      :map-style="style"
      :center="MAP_INITIAL_CENTER"
      :zoom="mapState.zoom.value"
      :max-zoom="22"
      :bearing="20"
      interactive
    >
      <MglMarker
        v-if="
          mapState.userLocation.value &&
          isAroundUEC(mapState.userLocation.value)
        "
        :coordinates="mapState.userLocation.value"
      >
        <template #marker>
          <div
            class="bg-blue-500 rounded-full w-4 h-4 border-2 border-white shadow shadow-blue-800"
          />
        </template>
      </MglMarker>
    </MglMap>
    <div
      class="absolute flex-col-reverse md:flex-col top-17 right-2 md:top-auto md:right-auto md:bottom-2 md:left-2 z-50 pointer-events-auto w-fit h-fit flex gap-y-2 print:hidden"
    >
      <UFieldGroup
        orientation="vertical"
        v-show="mapState.zoom.value >= ZOOM_LEVELS.BUILDING_DETAILS"
      >
        <UButton
          color="neutral"
          class="cursor-pointer grid place-items-center"
          icon="material-symbols:arrow-upward"
          variant="outline"
          size="lg"
          :disabled="mapState.floor.value.level >= 10"
          @click="upFloor"
          aria-label="Zoom in"
        />
        <UBadge
          class="w-10 grid place-items-center"
          color="neutral"
          variant="outline"
          size="lg"
          :label="mapState.floor.value.labelWithSuffix"
        />
        <UButton
          color="neutral"
          class="cursor-pointer grid place-items-center"
          icon="material-symbols:arrow-downward"
          variant="outline"
          size="lg"
          :disabled="mapState.floor.value.level <= -1"
          @click="downFloor"
          aria-label="Zoom out"
        />
      </UFieldGroup>
      <UButton
        v-if="
          mapState.userLocation.value &&
          isAroundUEC(mapState.userLocation.value)
        "
        class="cursor-pointer"
        color="neutral"
        size="lg"
        icon="material-symbols:location-searching"
        variant="outline"
        @click="
          mapState.jumpTo({ center: mapState.userLocation.value, zoom: 18 })
        "
        aria-label="Locate me"
      />
      <UFieldGroup orientation="vertical" class="pointer-events-auto">
        <UButton
          color="neutral"
          class="cursor-pointer grid place-items-center"
          icon="material-symbols:zoom-in"
          size="lg"
          variant="outline"
          @click="mapInstance.map?.zoomIn()"
          aria-label="Zoom in"
        />
        <UButton
          color="neutral"
          class="cursor-pointer grid place-items-center"
          icon="material-symbols:zoom-out"
          size="lg"
          variant="outline"
          @click="mapInstance.map?.zoomOut()"
          aria-label="Zoom out"
        />
      </UFieldGroup>
    </div>
  </div>
</template>

<script setup lang="ts">
import { setMaxParallelImageRequests, setWorkerUrl } from "maplibre-gl";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";

setWorkerUrl(workerUrl);
setMaxParallelImageRequests(16);

import { MglMap, MglMarker, useMap } from "@indoorequal/vue-maplibre-gl";

import { centroid } from "@turf/turf";
import { ZOOM_LEVELS } from "~/map-style/theme/zoom";

const { paths, idMap, typeMap, getFloorForFeature } = useSpatialEntries();

watch(
  [() => typeMap.value.BuildingEntrance, () => paths.value],
  ([newVal, pathsData]) => {
    if (newVal && pathsData) {
      initPathFinding(
        pathsData.features,
        typeMap.value.Building,
        typeMap.value.BuildingEntrance,
      );
    }
  },
);

const mapInstance = useMap();
const mapState = useMapState();
const shouldUseExtrusion = computed(() => mapState.pitch.value > 30);
const isDesktop = useDesktopQuery();

const downFloor = () => {
  if (mapState.floor.value.level === 1) {
    mapState.floor.value.level = -1;
  } else if (mapState.floor.value.level > -1) {
    mapState.floor.value.level -= 1;
  }
};

const upFloor = () => {
  if (mapState.floor.value.level === -1) {
    mapState.floor.value.level = 1;
  } else if (mapState.floor.value.level < 10) {
    mapState.floor.value.level += 1;
  }
};

watch(
  () => mapInstance.isMounted,
  async (isMounted) => {
    if (!isMounted || !mapInstance.map) return;
    const map = mapInstance.map;
    mapState.map.value = map;
    await loadMapIcons(map);

    // query both icon and text symbol layers for gates so clicks hit either
    const interactiveLayers = [
      "buildings",
      "floors",
      "gates-icon-symbol",
      "gates-text-symbol",
    ];

    map.on("pitch", () => {
      mapState.pitch.value = map.getPitch();
    });

    map.on("zoomend", () => {
      mapState.zoom.value = map.getZoom();
    });

    map.on("moveend", () => {
      const center = map.getCenter();
      mapState.center.value = [center.lng, center.lat];
    });

    map.on("click", (e) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: interactiveLayers,
      });
      if (features.length > 0) {
        const feature = idMap.value.get(
          features[0]?.properties.id?.toString() || "",
        );
        if (!feature) return;

        const layerType = (
          {
            buildings: "Building",
            floors: "Room",
            "gates-icon-symbol": "Gate",
            "gates-text-symbol": "Gate",
          } as const
        )[features[0]?.layer.id as string];
        if (!layerType) return;
        if (layerType === "Room" && feature.properties?.type === "corridor")
          return;
        const selectedObject: Partial<SelectedObject> = {
          type: layerType,
          id: feature.id?.toString() || "",
          properties: feature.properties || {},
          geometry: feature.geometry,
          coordinate:
            feature.geometry.type === "Point"
              ? (feature.geometry.coordinates as [number, number])
              : (centroid(feature.geometry).geometry.coordinates as [
                  number,
                  number,
                ]),
        };
        if (selectedObject.type === "Room") {
          if (selectedObject.properties?.type === "Passage") return;
          const building = typeMap.value.Building.find((bld) =>
            layerType === "Room"
              ? feature.properties?.ancestors?.includes(bld.id)
              : false,
          );
          if (building) {
            selectedObject.building = {
              type: "Building",
              id: building.properties.id || "",
              properties: building.properties || {},
              coordinate: centroid(building.geometry as GeoJSON.MultiPolygon)
                .geometry.coordinates as [number, number],
            };
          } else {
            selectedObject.building = {
              type: "Building",
              id: "",
              properties: {},
              coordinate: [0, 0],
            };
          }
        }
        mapState.selectedObject.value = selectedObject as SelectedObject;
      } else {
        mapState.selectedObject.value = null;
      }
    });

    for (const layer of interactiveLayers) {
      map.on("mouseenter", layer, () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", layer, () => {
        map.getCanvas().style.cursor = "";
      });
    }
  },
);

watch(
  () => mapState.selectedObject.value,
  (newVal) => {
    if (newVal) {
      mapState.jumpTo({
        center: newVal.coordinate,
        zoom: Math.max(
          mapState.zoom.value,
          newVal.type === "Room"
            ? ZOOM_LEVELS.BUILDING_DETAILS
            : ZOOM_LEVELS.ALL_BUILDINGS,
        ),
      });
      if (newVal.type === "Room") {
        mapState.floor.value = getFloorForFeature(newVal) || new FloorLevel(1);
      }
    }
  },
);

const style = useMapStyle(shouldUseExtrusion, isDesktop);
</script>

<style>
.maplibregl-map {
  overflow: hidden;
  position: relative;
  -webkit-tap-highlight-color: rgb(0 0 0 / 0);
}
.maplibregl-canvas {
  position: absolute;
  left: 0;
  top: 0;
}
.maplibregl-canvas-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.maplibregl-canvas-container.maplibregl-interactive {
  cursor: grab;
  -webkit-user-select: none;
  -moz-user-select: none;
  user-select: none;
}
.maplibregl-canvas-container.maplibregl-interactive.maplibregl-track-pointer {
  cursor: pointer;
}
.maplibregl-canvas-container.maplibregl-interactive:active {
  cursor: grabbing;
}
.maplibregl-canvas-container.maplibregl-touch-zoom-rotate,
.maplibregl-canvas-container.maplibregl-touch-zoom-rotate .maplibregl-canvas {
  touch-action: pan-x pan-y;
}
.maplibregl-canvas-container.maplibregl-touch-drag-pan,
.maplibregl-canvas-container.maplibregl-touch-drag-pan .maplibregl-canvas {
  touch-action: pinch-zoom;
}
.maplibregl-canvas-container.maplibregl-touch-zoom-rotate.maplibregl-touch-drag-pan,
.maplibregl-canvas-container.maplibregl-touch-zoom-rotate.maplibregl-touch-drag-pan
  .maplibregl-canvas {
  touch-action: none;
}
.maplibregl-crosshair,
.maplibregl-crosshair .maplibregl-interactive,
.maplibregl-crosshair .maplibregl-interactive:active {
  cursor: crosshair;
}
.maplibregl-boxzoom {
  position: absolute;
  top: 0;
  left: 0;
  width: 0;
  height: 0;
  background: #fff;
  border: 2px dotted #202020;
  opacity: 0.5;
}

.maplibregl-marker {
  position: absolute;
  top: 0;
  left: 0;
  will-change: transform;
  transition: opacity 0.2s;
}
.maplibregl-marker-draggable {
  cursor: grab;
}

.maplibregl-ctrl-bottom-right {
  position: absolute;
  right: 0;
  bottom: 0;
  z-index: 2;
  pointer-events: none;
}
.maplibregl-ctrl {
  clear: both;
  pointer-events: auto;
  transform: translate(0, 0);
}
.maplibregl-ctrl-bottom-right .maplibregl-ctrl {
  margin: 0 10px 10px 0;
  float: right;
}

.maplibregl-ctrl.maplibregl-ctrl-attrib {
  padding: 0 5px;
  background-color: rgb(255 255 255 / 0.7);
  margin: 0;
  font-size: 11px;
}
.maplibregl-ctrl-attrib a {
  color: rgb(0 0 0 / 0.75);
  text-decoration: none;
}
.maplibregl-ctrl-attrib a:hover {
  color: inherit;
  text-decoration: underline;
}
.maplibregl-attrib-empty {
  display: none;
}

.maplibregl-ctrl-attrib.maplibregl-compact {
  height: 24px;
  padding: 0;
  margin: 10px;
  position: relative;
  background-color: transparent;
  border-radius: 12px;
  box-sizing: content-box;
}
.maplibregl-ctrl-attrib.maplibregl-compact .maplibregl-ctrl-attrib-inner {
  display: none;
}
.maplibregl-ctrl-attrib.maplibregl-compact-show {
  padding: 0 28px 0 8px;
  background-color: #fff;
  visibility: visible;
  display: flex;
  align-items: center;
}
.maplibregl-ctrl-attrib.maplibregl-compact-show .maplibregl-ctrl-attrib-inner {
  display: block;
}

.maplibregl-ctrl-attrib-button {
  cursor: pointer;
  position: absolute;
  background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 20 20'%3E%3Cpath fill='%23333' fill-rule='evenodd' d='M4 10a6 6 0 1 0 12 0 6 6 0 1 0-12 0m5-3a1 1 0 1 0 2 0 1 1 0 1 0-2 0m0 3a1 1 0 1 1 2 0v3a1 1 0 1 1-2 0'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: center;
  background-color: rgb(255 255 255 / 0.8);
  width: 24px;
  height: 24px;
  box-sizing: border-box;
  border-radius: 12px;
  outline: none;
  top: 0;
  right: 0;
  border: 0;
}

.maplibregl-ctrl-attrib summary.maplibregl-ctrl-attrib-button {
  appearance: none;
  list-style: none;
}
.maplibregl-ctrl-attrib
  summary.maplibregl-ctrl-attrib-button::-webkit-details-marker {
  display: none;
}
</style>
