import React from "react";
import { StockManagementHeader } from "../stock-management-header/stock-management-header.component";
import StockManagementMetrics from "./stock-home-metrics";
import StockHomeDetailCards from "./stock-home-detail-cards.component";

export default function StockHomeLandingPage() {
  const basePath = `${window.getOpenmrsSpaBase()}stock-management`;
  return (
    <div style={{ backgroundColor: "white" }}>
      <StockManagementMetrics />
      <StockHomeDetailCards />
    </div>
  );
}
