<template>
  <MglMap :map-style="style" :center="center" :zoom="zoom">
    <MglNavigationControl/>
    <MglCustomControl>
      <button @click="floor = Math.min(floor + 1, 4)">▲</button>
      </MglCustomControl>
    <MglCustomControl>
      <button>{{ floor }}F</button>
    </MglCustomControl>
    <MglCustomControl>
      <button @click="floor = Math.max(floor - 1, 1)">▼</button>
    </MglCustomControl>
  </MglMap>
</template>

<script setup lang="ts">
import type { StyleSpecification } from "maplibre-gl";
import maplibregl from 'maplibre-gl';
import "maplibre-gl/dist/maplibre-gl.css";
import { buildMapStyle, setupTiles, UEC_MAP_SOURCE_ID } from "@e-chan1007/uec-map-sdk";

setupTiles(maplibregl);

const center = [139.544333, 35.655601] as [number, number];
const zoom = 16;

const floor = ref(1);

const style = computed<StyleSpecification>(() => buildMapStyle ( {
  version: 8,
  sources: {},
  layers: [
    {
      id: "areas",
      type: "fill",
      source: UEC_MAP_SOURCE_ID,
      "source-layer": "areas",
      minzoom: 0,
      maxzoom: 22,
      paint: {
        "fill-color": "#eeffff"
      },
    },
    {
      id: "buildings",
      type: "fill",
      source: UEC_MAP_SOURCE_ID,
      "source-layer": "buildings",
      minzoom: 0,
      maxzoom: 22,
      paint: {
        "fill-color": "#12288b",
        "fill-opacity": ["step", ["zoom"], 1, 19, 0.2]
      },
    },
    {
      id: "paths",
      type: "line",
      source: UEC_MAP_SOURCE_ID,
      "source-layer": "paths",
      filter: [">=", ["get", "weight"], 2],
      minzoom: 0,
      maxzoom: 22,
      paint: {
        "line-color": "#333333",
        "line-width": ["get", "weight"],
      },
    },
    {
      "id": "buildings-label",
      "type": "symbol",
      "source": UEC_MAP_SOURCE_ID,
      "source-layer": "buildings_label",
      minzoom: 15,
      maxzoom: 19,
      "layout": {
        "text-field": ["get", "name"],
        "text-size": 16,
        "text-allow-overlap": false,
        "text-ignore-placement": false
      },
      "paint": {
        "text-color": "#000000",
        "text-halo-color": "#FFFFFF",
        "text-halo-width": 2
      },
    },
    {
      id: "floors",
      type: "fill",
      source: UEC_MAP_SOURCE_ID,
      "source-layer": "floors",
      minzoom: 19,
      maxzoom: 22,
      filter: ["==", ["get", "floor"], ["to-number", floor.value]],
      paint: {
        "fill-color": [
          "match",
          ["get", "type"],
          "misc", "#969696",
          "corridor", "#EAEAEA",
          "elevator", "#C8C8C8",
          "stairs", "#C8C8C8",
          "lecture_room", "#D3F1FF",
          "wc_universal", "#AC8DCE",
          "wc_unknown", "#C7A3C6",
          "wc_men", "#8DA2DB",
          "wc_women", "#CE8D9B",
          "common_space", "#FFEBA6",
          "office", "#B1E4B2",
          /* default */ "#31A6D4"
        ],
        "fill-outline-color": "#232323",
      },
    },
    {
      id: "floors-label",
      type: "symbol",
      source: UEC_MAP_SOURCE_ID,
      "source-layer": "floors_label",
      minzoom: 19,
      maxzoom: 22,
      filter: ["all", ["==", ["get", "floor"], ["to-number", floor.value]], ["!=", ["get", "type"], "elevator"]],
      layout: {
        "text-field": ["get", "name"],
        "text-size": 16,
        "text-allow-overlap": false,
        "text-ignore-placement": false,
        "symbol-placement": "point"
      },
      paint: {
        "text-color": "#000000",
        "text-halo-color": "#FFFFFF",
        "text-halo-width": 2,
      },
    }
  ],

}));
</script>
