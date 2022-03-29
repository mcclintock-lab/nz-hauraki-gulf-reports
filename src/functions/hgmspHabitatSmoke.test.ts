/**
 * @group smoke
 * @jest-environment node
 */
import Handler from "./hgmspHabitat";
import {
  getExamplePolygonSketchAll,
  writeResultOutput,
} from "@seasketch/geoprocessing/scripts/testing";

describe("Basic smoke tests", () => {
  test("handler function is present", () => {
    expect(typeof Handler.func).toBe("function");
  });
  test("hgmspHabitat - tests run against all examples", async () => {
    const examples = await getExamplePolygonSketchAll();
    for (const example of examples) {
      const result = await Handler.func(example);
      expect(result).toBeTruthy();
      writeResultOutput(result, "hgmspHabitat", example.properties.name);
    }
  }, 180000);
});
