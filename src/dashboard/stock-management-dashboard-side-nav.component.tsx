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
      name: t("stockManagementOrders", "Orders"),
      link: "orders",
    },
    {
      name: t("stockManagementRequisitions", "Requisitions"),
      link: "requisitions",
    },
    {
      name: t("stockManagementStockList", "Stock List"),
      link: "stock-list",
    },
    {
      name: t("stockManagementExpiredStock", "Expired Stock"),
      link: "expired-stock",
    },
    {
      name: t("stockManagementSettings", "Settings"),
      link: "settings",
    },
  ];

  return <SideNavItemsList tabs={tabs} selectedIndex={selectedTab} onSelectTab={setSelectedTab} />;
};

export default StockManagementDashboardSideNav;
