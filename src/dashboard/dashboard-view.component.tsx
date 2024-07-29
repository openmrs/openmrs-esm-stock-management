import React from "react";
import { ExtensionSlot } from "@openmrs/esm-framework";
import styles from "./dashboard-view.scss";
import { StockManagementHeader } from "../stock-management-header/stock-management-header.component";

const DashboardView: React.FC<{ dashboardSlot: string; title: string }> = ({
  dashboardSlot,
  title,
}) => {
  return (
    <>
      <StockManagementHeader />
      <ExtensionSlot
        className={styles.dashboardView}
        name={dashboardSlot}
        state={{ dashboardTitle: title }}
      />
    </>
  );
};

export default DashboardView;
