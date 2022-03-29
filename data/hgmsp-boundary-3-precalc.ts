// Run inside workspace

import fs from "fs";
import {
  Metric,
  createMetric,
  rekeyMetrics,
  ReportResultBase,
} from "@seasketch/geoprocessing";
import config from "../src/_config";
import area from "@turf/area";
import { featureCollection } from "@turf/helpers";

const METRIC = config.metricGroups.boundaryAreaOverlap;
const CLASSES = METRIC.classes;
const DATASET = `hgmspBoundary`;
const DEST_PATH = `${__dirname}/precalc/${DATASET}Totals.json`;

const allFc = JSON.parse(
  fs.readFileSync(`${__dirname}/dist/${METRIC.baseFilename}.json`).toString()
);

async function main() {
  const metrics: Metric[] = await Promise.all(
    CLASSES.map(async (curClass) => {
      // Filter out null geometry
      const classFeatures = allFc.features.filter((feat: any) => {
        return feat.geometry;
      }, []);
      const classFC = featureCollection(classFeatures);
      const value = area(classFC);
      return createMetric({
        classId: curClass.classId,
        metricId: METRIC.metricId,
        value,
      });
    })
  );

  const result: ReportResultBase = {
    metrics: rekeyMetrics(metrics),
  };

  fs.writeFile(DEST_PATH, JSON.stringify(result, null, 2), (err) =>
    err
      ? console.error("Error", err)
      : console.info(`Successfully wrote ${DEST_PATH}`)
  );
}

main();
