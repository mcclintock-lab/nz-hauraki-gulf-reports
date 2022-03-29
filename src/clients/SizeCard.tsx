import React from "react";
import {
  useSketchProperties,
  ResultsCard,
  KeySection,
  Collapse,
  Table,
  Column,
  ReportTableStyled,
} from "@seasketch/geoprocessing/client-ui";
import {
  percentWithEdge,
  roundLower,
  ReportResult,
  firstMatchingMetric,
  ReportResultBase,
  toNullSketchArray,
  nestMetrics,
  keyBy,
  squareMeterToKilometer,
} from "@seasketch/geoprocessing/client-core";
import styled from "styled-components";
import config from "../_config";

import precalcMetrics from "../../data/precalc/hgmspBoundaryTotals.json";
const precalcTotals = precalcMetrics as ReportResultBase;

const TableStyled = styled(ReportTableStyled)`
  font-size: 12px;
  td {
    text-align: right;
  }

  tr:nth-child(1) > th:nth-child(n + 1) {
    text-align: center;
  }

  tr:nth-child(2) > th:nth-child(n + 1) {
    text-align: center;
  }

  tr > td:nth-child(1),
  tr > th:nth-child(1) {
    border-right: 1px solid #777;
  }

  tr:nth-child(1) > th:nth-child(2) {
    border-right: 1px solid #777;
  }

  tr > td:nth-child(3),
  tr > th:nth-child(3) {
    border-right: 1px solid #777;
  }
  tr > td:nth-child(5),
  tr > th:nth-child(5) {
    border-right: 1px solid #777;
  }
`;

const Number = new Intl.NumberFormat("en", { style: "decimal" });
const METRIC = config.metricGroups.boundaryAreaOverlap;
const PERC_METRIC_NAME = `${METRIC.metricId}Perc`;

const SizeCard = () => {
  const [{ isCollection }] = useSketchProperties();
  return (
    <ResultsCard title="Size" functionName="hgmspBoundary">
      {(data: ReportResult) => {
        const areaMetric = firstMatchingMetric(
          data.metrics,
          (m) => m.sketchId === data.sketch.properties.id
        );

        const areaDisplay = roundLower(
          squareMeterToKilometer(areaMetric.value)
        );
        const percArea = areaMetric.value / precalcTotals.metrics[0].value;
        const percDisplay = percentWithEdge(percArea);
        const areaUnitDisplay = "sq. km";
        return (
          <>
            <KeySection>
              This plan is{" "}
              <b>
                {areaDisplay} {areaUnitDisplay}
              </b>
              , which is <b>{percDisplay}</b> of the total planning area.
            </KeySection>
            {isCollection && (
              <Collapse title="Show by MPA">
                {genNetworkSizeTable(data)}
              </Collapse>
            )}
          </>
        );
      }}
    </ResultsCard>
  );
};

const genNetworkSizeTable = (data: ReportResult) => {
  const sketches = toNullSketchArray(data.sketch);
  const sketchesById = keyBy(sketches, (sk) => sk.properties.id);
  const sketchIds = sketches.map((sk) => sk.properties.id);
  const sketchMetrics = data.metrics.filter(
    (m) => m.sketchId && sketchIds.includes(m.sketchId)
  );
  const aggMetrics = nestMetrics(sketchMetrics, [
    "sketchId",
    "classId",
    "metricId",
  ]);
  // Use sketch ID for each table row, index into aggMetrics
  const rows = Object.keys(aggMetrics).map((sketchId) => ({
    sketchId,
  }));

  const classColumns: Column<{ sketchId: string }>[] = METRIC.classes.map(
    (curClass, index) => ({
      Header: curClass.display,
      style: { color: "#777" },
      columns: [
        {
          Header: "Area" + " ".repeat(index),
          accessor: (row) => {
            const value =
              aggMetrics[row.sketchId][curClass.classId as string]
                .boundaryAreaOverlap[0].value;
            return (
              Number.format(Math.round(squareMeterToKilometer(value))) +
              " sq. mi."
            );
          },
        },
        {
          Header: "% Area" + " ".repeat(index),
          accessor: (row) => {
            const value =
              aggMetrics[row.sketchId][curClass.classId as string][
                PERC_METRIC_NAME
              ][0].value;
            return percentWithEdge(value);
          },
        },
      ],
    })
  );

  const columns: Column<any>[] = [
    {
      Header: " ",
      accessor: (row) => <b>{sketchesById[row.sketchId].properties.name}</b>,
    },
    ...classColumns,
  ];

  return (
    <TableStyled>
      <Table columns={columns} data={rows} />
    </TableStyled>
  );
};

export default SizeCard;
