#!/bin/bash

SRC_PATH=src
DST_PATH=dist
LAYER=HGMSP_Habitats_2021
declare -a ATTRIBS_TO_KEEP=(
  "Habitat"
)

# Data doesn't cross 180 antimeridian so no need to split

# Get habitat names
# ogrinfo -dialect SQLite -sql 'SELECT * FROM HGMSP_Habitats_2021' src/HGMSP_Habitats_2021.shp

ogr2ogr -t_srs "EPSG:4326" -f FlatGeobuf -explodecollections -dialect OGRSQL -sql "SELECT ${ATTRIBS_TO_KEEP} FROM ${LAYER}" "${DST_PATH}/${LAYER}.fgb" "${SRC_PATH}/${LAYER}.shp"
ogr2ogr -f GeoJSON "${DST_PATH}/${LAYER}.json" "${DST_PATH}/${LAYER}.fgb"

# Create clip boundary for preprocessor - union all polygons
ogr2ogr -t_srs "EPSG:4326" -f FlatGeobuf -explodecollections -dialect sqlite -sql "SELECT st_union(geometry) from HGMSP_Habitats_2021" "${DST_PATH}/HGMSP_habitat_boundary.fgb" "${SRC_PATH}/${LAYER}.shp"
ogr2ogr -t_srs "EPSG:4326" -f Geojson -explodecollections -dialect sqlite -sql "SELECT st_union(geometry) from HGMSP_Habitats_2021" "${DST_PATH}/HGMSP_habitat_boundary.json" "${SRC_PATH}/${LAYER}.shp"


