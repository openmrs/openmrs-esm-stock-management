import React from "react";
import { ConfigurableLink } from "@openmrs/esm-framework";
import { spaBasePath } from "./constants";

export default function StockManagementLink() {
  return (
    <ConfigurableLink to={spaBasePath}>
      <span>Commodity</span>
    </ConfigurableLink>
  );
}
