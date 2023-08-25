import React from "react";
import { ConfigurableLink } from "@openmrs/esm-framework";

export default function StockManagementLink() {
  return (
    <ConfigurableLink to={window.getOpenmrsSpaBase()}>
      <span>Commodity</span>
    </ConfigurableLink>
  );
}
