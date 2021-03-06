import {
  ValidationError,
  PreprocessingHandler,
  isPolygonFeature,
  Feature,
  Polygon,
  MultiPolygon,
  clip,
  VectorDataSource,
  toJsonFile,
} from "@seasketch/geoprocessing";
import area from "@turf/area";
import bbox from "@turf/bbox";
import bboxPolygon from "@turf/bbox-polygon";
import { featureCollection as fc, multiPolygon } from "@turf/helpers";
import flatten from "@turf/flatten";
import kinks from "@turf/kinks";
import { clipMultiMerge } from "@seasketch/geoprocessing";
import { fgbFetchAll } from "@seasketch/geoprocessing/dataproviders";
import config from "../_config";

const MAX_SIZE = 500000 * 1000 ** 2;

// export type PlanningAreaFeature = Feature<MultiPolygon>;
export type BoundaryFeature = Feature<MultiPolygon>;

const SubdividedBoundarySource = new VectorDataSource<BoundaryFeature>(
  "https://dnaniiqf0f48s.cloudfront.net"
);

export async function clipToPlanningArea(feature: Feature<Polygon>) {
  const box = bbox(feature);
  const url = `${config.dataBucketUrl}${config.clipPreprocessor.filename}`;
  const clipFeatures = await fgbFetchAll<BoundaryFeature>(url, box);
  // let clipFeatures = await SubdividedBoundarySource.fetchUnion(box, "gid");

  if (clipFeatures.length === 0) return feature;
  // console.log("clip features", clipFeatures, clipFeatures.features.length);
  // toJsonFile(clipFeatures, "clip.geojson");
  // console.log(clipFeatures);
  // return clipMultiMerge(feature, fc(clipFeatures), "intersection");
  return clip(
    fc([multiPolygon([feature.geometry.coordinates]), ...clipFeatures]),
    "intersection"
  );
}

/**
 * Takes a Polygon feature and returns the portion that is in the ocean and within an EEZ boundary
 * If results in multiple polygons then returns the largest
 */
export async function clipSketch(feature: Feature): Promise<Feature> {
  if (!isPolygonFeature(feature)) {
    throw new ValidationError("Input must be a polygon");
  }

  // if (area(feature) > MAX_SIZE) {
  //   throw new ValidationError(
  //     "Please limit sketches to under 500,000 square km"
  //   );
  // }

  const kinkPoints = kinks(feature);
  if (kinkPoints.features.length > 0) {
    throw new ValidationError("Your sketch polygon crosses itself.");
  }

  let clipped = await clipToPlanningArea(feature);

  if (!clipped || area(clipped) === 0) {
    throw new ValidationError("Sketch is outside of planning area");
  } else {
    if (clipped.geometry.type === "MultiPolygon") {
      const flattened = flatten(clipped);
      let biggest = [0, 0];
      for (var i = 0; i < flattened.features.length; i++) {
        const a = area(flattened.features[i]);
        if (a > biggest[0]) {
          biggest = [a, i];
        }
      }
      return flattened.features[biggest[1]] as Feature<Polygon>;
    } else {
      return clipped;
    }
  }
}

export default new PreprocessingHandler(clipSketch, {
  title: "clipSketch",
  description: "Erases portion of sketch extending outside of valid area",
  timeout: 120,
  memory: 10240,
  requiresProperties: [],
});
