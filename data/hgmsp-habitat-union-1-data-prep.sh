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

ogr2ogr -t_srs "EPSG:4326" -nlt POLYGON -explodecollections -dialect OGRSQL -sql "SELECT ${ATTRIBS_TO_KEEP} FROM ${LAYER}" "${DST_PATH}/${LAYER}.shp" "${SRC_PATH}/${LAYER}.shp"

# Unused
#ogr2ogr -t_srs "EPSG:4326" -f FlatGeobuf -explodecollections -dialect OGRSQL -sql "SELECT ${ATTRIBS_TO_KEEP} FROM ${LAYER}" "${DST_PATH}/${LAYER}.fgb" "${SRC_PATH}/${LAYER}.shp"

# For precalc
ogr2ogr -f GeoJSON "${DST_PATH}/${LAYER}.json" "${DST_PATH}/${LAYER}.shp"

