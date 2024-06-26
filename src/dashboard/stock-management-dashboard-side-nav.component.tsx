import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { SideNavItem } from "../core/components/side-nav/types";
import SideNavItemsList from "../core/components/side-nav/side-nav.component";

const StockManagementDashboardSideNav = () => {
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState(0);

  const tabs: SideNavItem[] = [
    {
      name: t("stockManagementOverview", "Overview"),
      link: "overview",
    },
    {
      name: t("stockManagementStockItems", "All Items"),
      link: "stock-items",
    },
    {
      name: t("stockManagementOperations", "Operations"),
      link: "stock-operations",
    },
    {
      name: t("stockManagementStockUserScopes", "User Role Scopes"),
      link: "stock-user-scopes",
    },
    {
      name: t("stockManagementStockSources", "Sources"),
      link: "stock-sources",
    },
    {
      name: t("stockManagementLocations", "Locations"),
      link: "stock-locations",
    },
    {
      name: t("stockManagementReports", "Reports"),
      link: "stock-reports",
    },
    {
      name: t("stockManagementSettings", "Settings"),
      link: `admin/maintenance/settings.list?show=Stockmanagement`,
    },
  ];

  return (
    <SideNavItemsList
      tabs={tabs}
      selectedIndex={selectedTab}
      onSelectTab={setSelectedTab}
    />
  );
};

export default StockManagementDashboardSideNav;
