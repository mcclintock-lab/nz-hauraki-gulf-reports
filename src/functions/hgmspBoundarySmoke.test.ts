/**
 * @group smoke
 */
import { area } from "./hgmspBoundary";
import {
  getExamplePolygonSketchAll,
  writeResultOutput,
} from "@seasketch/geoprocessing/scripts/testing";

describe("Basic smoke tests", () => {
  test("handler function is present", () => {
    expect(typeof area).toBe("function");
  });
  test("hgmspBoundary - tests run against all examples", async () => {
    const examples = await getExamplePolygonSketchAll("whole gulf clipped");
    for (const example of examples) {
      const result = await area(example);
      expect(result).toBeTruthy();
      writeResultOutput(result, "hgmspBoundary", example.properties.name);
    }
  });
});
