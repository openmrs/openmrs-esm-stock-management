import React from "react";
import { StockManagementHeader } from "../stock-management-header/stock-management-header.component";
import Overlay from "../core/components/overlay/overlay.component";
import styles from "./stock-management-dashboard.scss";
import StockManagementDashboardSideNav from "./stock-management-dashboard-side-nav.component";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import StockHomeLandingPage from "../stock-home/stock-home-landing-page-component";
import StockUserScopes from "../stock-user-role-scopes/stock-user-role-scopes.component";
import StockSources from "../stock-sources/stock-sources.component";
import StockOperationsComponent from "../stock-operations/stock-operations.component";
import StockItems from "../stock-items/stock-items.component";
import StockSettings from "../stock-settings/stock-settings.component";
import StockLocations from "../stock-locations/stock-locations.component";
import StockReports from "../stock-reports/report-list/stock-reports.component";

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
            <Route path="stock-items" element={<StockItems />} />
            <Route
              path="stock-operations"
              element={<StockOperationsComponent />}
            />
            <Route path="stock-user-scopes" element={<StockUserScopes />} />
            <Route path="stock-sources" element={<StockSources />} />
            <Route path="stock-locations" element={<StockLocations />} />
            <Route path="stock-reports" element={<StockReports />} />
            <Route path="stock-settings" element={<StockSettings />} />
          </Routes>
        </div>
        <Overlay />
      </div>
    </BrowserRouter>
  );
}
