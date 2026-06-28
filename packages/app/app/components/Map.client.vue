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
import { useMap } from "@indoorequal/vue-maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import { ZOOM_LEVELS } from "~/map-style/theme/zoom";
import { centroid } from "@turf/turf";

const { paths, idMap, typeMap, getFloorForFeature } = useSpatialEntries();

initPathFinding(paths.features, typeMap.value.BuildingEntrance);

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
