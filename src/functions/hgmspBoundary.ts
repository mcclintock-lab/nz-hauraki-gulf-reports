import {
  overlapArea,
  rekeyMetrics,
  sortMetrics,
  toNullSketch,
  Sketch,
  SketchCollection,
  GeoprocessingHandler,
  Polygon,
  ReportResult,
  ReportResultBase,
} from "@seasketch/geoprocessing";
import config from "../_config";

import precalcMetrics from "../../data/precalc/hgmspBoundaryTotals.json";
const precalcTotals = precalcMetrics as ReportResultBase;

const METRIC = config.metricGroups.boundaryAreaOverlap;
const CLASS = METRIC.classes[0];

export async function area(
  sketch: Sketch<Polygon> | SketchCollection<Polygon>
): Promise<ReportResult> {
  const areaMetrics = (
    await overlapArea(METRIC.metricId, sketch, precalcTotals.metrics[0].value)
  ).map((metric) => ({ ...metric, classId: CLASS.classId }));

  return {
    metrics: rekeyMetrics(sortMetrics(areaMetrics)),
    sketch: toNullSketch(sketch),
  };
}

export default new GeoprocessingHandler(area, {
  title: "hgmspBoundary",
  description: "returns boundary area metrics for sketch",
  timeout: 360, // seconds
  executionMode: "async",
  // Specify any Sketch Class form attributes that are required
  requiresProperties: [],
  memory: 10240,
});
