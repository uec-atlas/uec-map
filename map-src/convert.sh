#!/bin/bash
tippecanoe -o map.pmtiles \
  -r1 \
  --no-feature-limit \
  --detect-shared-borders \
  --force \
  -z 18 \
  -L areas:<(ogr2ogr -f GeoJSONSeq /vsistdout/ areas.gpkg) \
  -L areas_label:<(ogr2ogr -f GeoJSONSeq /vsistdout/ areas.gpkg \
       -dialect sqlite \
       -sql "SELECT ST_Centroid(geom), * FROM areas") \
   \
  -L buildings:<(ogr2ogr -f GeoJSONSeq /vsistdout/ buildings.gpkg) \
  -L buildings_label:<(ogr2ogr -f GeoJSONSeq /vsistdout/ buildings.gpkg \
       -dialect sqlite \
       -sql "SELECT ST_Centroid(geom), * FROM buildings") \
   \
  -L floors:<(ogr2ogr -f GeoJSONSeq /vsistdout/ indoor_floors.gpkg) \
  -L floors_label:<(
    for layer in $(ogrinfo -q indoor_floors.gpkg | grep -o '[^ ]*_floors_[^ ]*'); do
      ogr2ogr -f GeoJSONSeq /vsistdout/ indoor_floors.gpkg \
        -sql "SELECT ST_Centroid(geom), * FROM \"$layer\""
    done
  ) \
  -L gates:<(ogr2ogr -f GeoJSONSeq /vsistdout/ gates.gpkg) \
  -L entrances:<(ogr2ogr -f GeoJSONSeq /vsistdout/ entrances.gpkg) \
  -L paths:<(ogr2ogr -f GeoJSONSeq /vsistdout/ paths.gpkg)

ogr2ogr -f GeoJSON areas.json areas.gpkg -t_srs EPSG:4326
ogr2ogr -f GeoJSON buildings.json buildings.gpkg -t_srs EPSG:4326
ogr2ogr -f GeoJSON gates.json gates.gpkg -t_srs EPSG:4326
ogr2ogr -f GeoJSON entrances.json entrances.gpkg -t_srs EPSG:4326
ogr2ogr -f GeoJSON paths.json paths.gpkg -t_srs EPSG:4326
