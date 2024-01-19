import React from "react";
import { StockManagementHeader } from "../stock-management-header/stock-management-header.component";
import StockCommodityTabs from "../stock-tabs/commodity-tabs.component";
import StockMetrics from "../stock-home/stock-home-metrics";
import Overlay from "../core/components/overlay/overlay.component";
import styles from "./stock-management-dashboard.scss";
import StockManagementDashboardSideNav from "./stock-management-dashboard-side-nav.component";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import StockHomeDetailCards from "../stock-home/stock-home-detail-cards.component";
import StockHomeLandingPage from "../stock-home/stock-home-landing-page-component";

export default function StockManagementDashboard() {
  const basePath = `${window.getOpenmrsSpaBase()}stock-management`;
  return (
    <BrowserRouter basename={basePath}>
      <div className={styles.container}>
        <StockManagementDashboardSideNav />
        <div>
          <StockManagementHeader />
          <Routes>
            <Route path="overview" element={<StockHomeLandingPage />} />
            <Route path="" element={<StockHomeLandingPage />} />
            <Route path="orders" element={<StockCommodityTabs />} />
            <Route path="requisitions" element={<StockCommodityTabs />} />
            <Route path="expired-stock" element={<StockCommodityTabs />} />
            <Route path="stock-list" element={<StockCommodityTabs />} />
            <Route path="settings" element={<StockCommodityTabs />} />
          </Routes>
        </div>
        <Overlay />
      </div>
    </BrowserRouter>
  );
}
