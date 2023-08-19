import React from "react";
import { StockManagementHeader } from "../stock-management-header/stock-management-header.component";
import StockCommodityTabs from "../stock-tabs/commodity-tabs.component";

export default function StockManagementDashboard() {
  return (
    <div className={`omrs-main-content`}>
      <StockManagementHeader />
      <StockCommodityTabs />
    </div>
  );
}
