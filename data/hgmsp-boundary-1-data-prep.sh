# Data doesn't cross 180 antimeridian so no need to split

# Create clip boundary for preprocessor - union all polygons

# Gave up on using OGR, below resulted in fgb that returned null or undefined geometry
#ogr2ogr -t_srs "EPSG:4326" -f FlatGeobuf -explodecollections -dialect sqlite -sql "SELECT 'test' as name, st_union(st_buffer(geometry, 0)) from HGMSP_Habitats_2021" "${DST_PATH}/HGMSP_habitat_boundary.fgb" "${SRC_PATH}/${LAYER}.shp"
#ogr2ogr -t_srs "EPSG:4326" -f Geojson -explodecollections -dialect sqlite -sql "SELECT 'test' as name, st_union(geometry) from HGMSP_Habitats_2021" "${DST_PATH}/HGMSP_habitat_boundary.json" "${SRC_PATH}/${LAYER}.shp"

# In QGIS, buffer HGMSP_Habitats_2021 by 0 to fix validation issue
# Then to build boundary, dissolve, buffer by .001, then simplify by .001
# Exported from QGIS as HGMSP_habitat_boundary_simple_buffer.fgb

SRC_PATH=src
DST_PATH=dist
LAYER=HGMSP_habitat_boundary_simple_buffer
declare -a ATTRIBS_TO_KEEP=(
  "Habitat"
)

ogr2ogr "${DST_PATH}/${LAYER}.fgb" "${SRC_PATH}/${LAYER}.fgb"

# For subdivide
ogr2ogr -t_srs "EPSG:4326" -nlt POLYGON -explodecollections "${DST_PATH}/${LAYER}.shp" "${SRC_PATH}/${LAYER}.fgb"

# For precalc
ogr2ogr -f GeoJSON "${DST_PATH}/${LAYER}.json" "${SRC_PATH}/${LAYER}.fgb"