import React, { useState } from "react";
import { SegmentControl } from "@seasketch/geoprocessing/client-ui";
import HabitatPage from "./HabitatPage";

const enableAllTabs = false;
const AllReports = () => {
  const [tab, setTab] = useState<string>("Habitat");
  return (
    <>
      <div style={{ marginTop: 5 }}>
        <SegmentControl
          value={tab}
          onClick={(segment) => setTab(segment)}
          segments={["Habitat"]}
        />
      </div>
      <HabitatPage hidden={!enableAllTabs && tab !== "Habitat"} />
    </>
  );
};

export default AllReports;
