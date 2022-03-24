import React from "react";
import {
  Collapse,
  DataDownload,
  ResultsCard,
  SketchClassTable,
  useSketchProperties,
  SimpleButton
} from "@seasketch/geoprocessing/client-ui";
import {
  ReportResult,
  ReportResultBase,
  toNullSketchArray,
  flattenBySketchAllClass,
  metricsWithSketchId,
  toPercentMetric,
  squareMeterToKilometer,
  keyBy,
  Metric
} from "@seasketch/geoprocessing/client-core";
import { ClassTable } from "../components/ClassTable";
import config from "../_config";

import precalcMetrics from "../../data/precalc/hgmspHabitatTotals.json";
const precalcTotals = precalcMetrics as ReportResultBase;

const METRIC = config.metricGroups.hgmspAreaOverlap;

const FishingImpact = () => {
  const [{ isCollection }] = useSketchProperties();
  return (
    <>
      <ResultsCard title="Habitat" functionName="hgmspHabitat">
        {(data: ReportResult) => {

          const sketches = [...toNullSketchArray(data.sketch), data.sketch];
          const sketchesById = keyBy(sketches, (sk) => sk.properties.id);
          
          const areaPlusPercMetrics: Metric[] = [
            ...data.metrics.map(m => ({ ...m, value: squareMeterToKilometer(m.value)})),
            ...toPercentMetric(data.metrics, precalcTotals.metrics, `${METRIC.metricId}Perc`)
          ]

          // Single sketch or collection top-level
          const parentMetrics = metricsWithSketchId(
            areaPlusPercMetrics,
            [data.sketch.properties.id]
          );

          return (
            <>
              <p>
                This report summarizes overlap with each habitat type.
              </p>

              <Collapse title="Learn more">
                <p>
                  If a Network has overlapping areas, the overlap is removed before calculating the overall area for each habitat class.
                  </p>                
              </Collapse>

              <ClassTable
                titleText=" "
                valueColText="% Within Plan"
                percColText="Area"
                rows={parentMetrics}
                dataGroup={METRIC}
                showLayerToggle={false}
                showGoal={false}
                showArea
                formatPerc
                metricIdName={METRIC.metricId}
                percMetricIdName={`${METRIC.metricId}Perc`}
                unitLabel={"km²"}
                options={{
                  classColWidth: "50%",
                  percColWidth: "35%",
                  areaWidth: "15%",
                  showMapWidth: "0%",
                  goalWidth: "0%",
                }}
              />
              {isCollection && (
                <Collapse title="Show by MPA">{genSketchTable(data)}</Collapse>
              )}
              <DataDownload filename="hgmspHabitat" data={areaPlusPercMetrics} titleElement={<div style={isCollection ? {margin: '20px 0px 0px 0px'} : {}}>➥ Export Data</div>}/>
            </>
          );
        }}
      </ResultsCard>
    </>
  );
};

const genSketchTable = (data: ReportResult) => {
  const childSketches = toNullSketchArray(data.sketch);
  const childSketchIds = childSketches.map((sk) => sk.properties.id);
  const childSketchMetrics = toPercentMetric(
    metricsWithSketchId(data.metrics, childSketchIds),
    precalcTotals.metrics
  );
  const sketchRows = flattenBySketchAllClass(
    childSketchMetrics,
    METRIC.classes,
    childSketches
  );

  return <SketchClassTable rows={sketchRows} dataGroup={METRIC} formatPerc />;
};

export default FishingImpact;
