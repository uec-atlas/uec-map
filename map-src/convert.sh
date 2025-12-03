#!/bin/bash
tippecanoe -o map.pmtiles \
  -r1 \
  --no-feature-limit \
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
    for layer in $(ogrinfo -q indoor_floors.gpkg | grep -o 'building_[^ ]*'); do
      ogr2ogr -f GeoJSONSeq /vsistdout/ indoor_floors.gpkg \
        -sql "SELECT ST_Centroid(geom), * FROM \"$layer\""
    done
  ) \
  -L floor_walls:<(
    for layer in $(ogrinfo -q indoor_floors.gpkg | grep -o 'building_[^ ]*'); do
      ogr2ogr -f GeoJSONSeq /vsistdout/ indoor_floors.gpkg \
        -dialect sqlite \
        -sql "SELECT ST_Buffer(ST_Boundary(geom), 0.1) as geom, *, floor as level FROM \"$layer\""
    done
  ) \
  -L gates:<(ogr2ogr -f GeoJSONSeq /vsistdout/ gates.gpkg) \
  -L paths:<(ogr2ogr -f GeoJSONSeq /vsistdout/ paths.gpkg) \
  --extend-zooms-if-still-dropping \
  --detect-shared-borders
