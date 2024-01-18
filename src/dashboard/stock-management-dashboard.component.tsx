import React from "react";
import { StockManagementHeader } from "../stock-management-header/stock-management-header.component";
import StockCommodityTabs from "../stock-tabs/commodity-tabs.component";
import Overlay from "../core/components/overlay/overlay.component";
import styles from "./stock-management-dashboard.scss";
import StockManagementDashboardItems from "./stock-management-dashboard-items.component";
import { BrowserRouter, Route, Routes } from "react-router-dom";

export default function StockManagementDashboard() {
  const basePath = `${window.getOpenmrsSpaBase()}stock-management`;
  console.log("basePath", basePath);
  return (
    <BrowserRouter basename={basePath}>
      <div className={styles.container}>
        <StockManagementDashboardItems />
        <div>
          <StockManagementHeader />
          <Routes>
            <Route path="" element={<StockCommodityTabs />} />
          </Routes>
        </div>
        <Overlay />
      </div>
    </BrowserRouter>
  );
}
