#!/bin/bash

psql -t <<SQL
  DROP TABLE boundary;
  DROP TABLE boundary_final;
  DROP TABLE boundary_final_bundles;
SQL

# Import, keeping column name casing intact, and setting the SRID field to 4326
shp2pgsql -D -k -s 4326 dist/HGMSP_habitat_boundary.shp boundary | psql

# Create spatial index
psql -t <<SQL
  CREATE INDEX ON boundary USING gist(geom);
SQL

# Subdivide into new table land_subdivided
psql -f hgmsp-boundary-subdivide.sql
