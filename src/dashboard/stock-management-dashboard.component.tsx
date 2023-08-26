import React from "react";
import { StockManagementHeader } from "../stock-management-header/stock-management-header.component";
import StockCommodityTabs from "../stock-tabs/commodity-tabs.component";
import Overlay from "../core/components/overlay/overlay.component";
import styles from "./stock-management-dashboard.scss";

export default function StockManagementDashboard() {
  return (
    <div className={styles.container}>
      <StockManagementHeader />
      <StockCommodityTabs />
      <Overlay />
    </div>
  );
}
