import React, { useState } from "react";
import { SegmentControl } from "@seasketch/geoprocessing/client-ui";
import Overview from "./Overview";
import HabitatPage from "./HabitatPage";

const enableAllTabs = false;
const AllReports = () => {
  const [tab, setTab] = useState<string>("Size");
  return (
    <>
      <div style={{ marginTop: 5 }}>
        <SegmentControl
          value={tab}
          onClick={(segment) => setTab(segment)}
          segments={["Size", "Habitat"]}
        />
      </div>
      <Overview hidden={!enableAllTabs && tab !== "Size"} />
      <HabitatPage hidden={!enableAllTabs && tab !== "Habitat"} />
    </>
  );
};

export default AllReports;
