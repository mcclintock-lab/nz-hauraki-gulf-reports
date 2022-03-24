import {
  rekeyMetrics,
  sortMetrics,
  toNullSketch,
  Sketch,
  SketchCollection,
  GeoprocessingHandler,
  Polygon,
  ReportResult,
  Metric,
  Feature,
  overlapFeatures,
  VectorDataSource,
} from "@seasketch/geoprocessing";
import { fgbFetchAll } from "@seasketch/geoprocessing/dataproviders";
import bbox from "@turf/bbox";
import config from "../_config";

const METRIC = config.metricGroups.hgmspAreaOverlap;

// Multi-class vector dataset
export const classProperty = "Habitat";
export type HabitatProperties = {
  [classProperty]: string;
};

export type HabitatFeature = Feature<Polygon, HabitatProperties>;

const SubdividedEezLandUnionSource = new VectorDataSource<HabitatFeature>(
  "https://dubzz9vxudu4x.cloudfront.net"
);

export async function hgmspHabitat(
  sketch: Sketch<Polygon> | SketchCollection<Polygon>
): Promise<ReportResult> {
  const box = sketch.bbox || bbox(sketch);
  const url = `${config.dataBucketUrl}${METRIC.filename}`;
  // const features = await fgbFetchAll<HabitatFeature>(url, box);
  let features = await SubdividedEezLandUnionSource.fetch(box);

  const metrics: Metric[] = (
    await Promise.all(
      METRIC.classes.map(async (curClass) => {
        // Filter out single class, exclude null geometry too
        const classFeatures = features.filter((feat) => {
          return (
            feat.geometry && feat.properties[classProperty] === curClass.classId
          );
        }, []);
        const overlapResult = await overlapFeatures(
          METRIC.metricId,
          classFeatures,
          sketch,
          { chunkSize: 1000 }
        );
        // Transform from simple to extended metric
        return overlapResult.map(
          (metric): Metric => ({
            ...metric,
            classId: curClass.classId,
          })
        );
      })
    )
  ).reduce(
    // merge
    (metricsSoFar, curClassMetrics) => [...metricsSoFar, ...curClassMetrics],
    []
  );

  return {
    metrics: sortMetrics(rekeyMetrics(metrics)),
    sketch: toNullSketch(sketch, true),
  };
}

export default new GeoprocessingHandler(hgmspHabitat, {
  title: "hgmspHabitat",
  description: "returns area metrics for protection levels for sketch",
  timeout: 240, // seconds
  executionMode: "async",
  // Specify any Sketch Class form attributes that are required
  requiresProperties: [],
  memory: 8192,
});
