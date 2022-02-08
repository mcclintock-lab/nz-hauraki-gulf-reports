// Run inside workspace

import fs from "fs";
import config from "../src/_config";
import { FeatureCollection, Polygon } from "@seasketch/geoprocessing";

const REPORT = config.reports.hgmspHabitat;
const METRIC = REPORT.metrics.areaOverlap;

const allFc = JSON.parse(
  fs.readFileSync(`${__dirname}/dist/${METRIC.baseFilename}.json`).toString()
) as FeatureCollection<Polygon>;

const classes = allFc.features.reduce<Record<string, number>>(
  (classesSoFar, feat) => {
    if (!feat.properties) throw new Error("Missing properties");
    if (!METRIC.classProperty) throw new Error("Missing classProperty");
    const curClass = feat.properties[METRIC.classProperty];
    const curValue = classesSoFar[curClass];
    return { ...classesSoFar, [curClass]: curValue ? curValue + 1 : curValue };
  },
  {}
);

console.log(
  Object.keys(classes).map((curClass) => ({
    classId: curClass,
    display: curClass,
  }))
);
