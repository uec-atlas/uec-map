#!/bin/bash

pushd "$(dirname "$0")"

tippecanoe -o map.pmtiles \
  -r1 \
  -b 5 \
  -z 18 \
  -d 14 \
  --no-clipping \
  --no-line-simplification \
  --no-feature-limit \
  --force \
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

ogr2ogr -f GeoJSON areas.json areas.gpkg -t_srs EPSG:4326 -lco COORDINATE_PRECISION=6
ogr2ogr -f GeoJSON buildings.json buildings.gpkg -t_srs EPSG:4326 -lco COORDINATE_PRECISION=6

# floors.json: ループ内にも適用
rm -f floors.json
{
  echo '{"type":"FeatureCollection","features":['
  first=true
  for layer in $(ogrinfo -q indoor_floors.gpkg | grep -o '[^ ]*_floors_[^ ]*'); do
    if [ "$first" = false ]; then
      echo -n ','
    fi
    first=false
    # ここで丸めてから jq に渡すことで、jq の出力も6桁になります
    ogr2ogr -f GeoJSON /vsistdout/ indoor_floors.gpkg "$layer" -t_srs EPSG:4326 -lco COORDINATE_PRECISION=6 \
    | jq -c '.features[]' | tr '\n' ',' | sed 's/,$//'
  done
  echo ']}'
} > floors.json

ogr2ogr -f GeoJSON gates.json gates.gpkg -t_srs EPSG:4326 -lco COORDINATE_PRECISION=6
ogr2ogr -f GeoJSON entrances.json entrances.gpkg -t_srs EPSG:4326 -lco COORDINATE_PRECISION=6
ogr2ogr -f GeoJSON paths.json paths.gpkg -t_srs EPSG:4326 -lco COORDINATE_PRECISION=6

popd
