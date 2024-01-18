import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { SideNavItem } from "../core/components/side-nav/types";
import VerticalTabs from "../core/components/tabs/vertical-tabs.component";
import StockCommodityTabs from "../stock-tabs/commodity-tabs.component";
import SideNavItemsList from "../core/components/side-nav/side-nav.component";

const StockManagementDashboardItems = () => {
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState(0);
  const handleTabChange = (index: number) => {
    setSelectedTab(index);
  };
  const tabs: SideNavItem[] = [
    {
      name: t("stockManagementOverview", "Overview"),
      link: "overview",
    },
    {
      name: t("stockManagementOrders", "Orders"),
      link: "#",
      //TODO: Add component
    },
    {
      name: t("stockManagementRequisitions", "Requisitions"),
      link: "#",
      //TODO: Add component
    },
    {
      name: t("stockManagementStockList", "Stock List"),
      link: "#",
      //TODO: Add component
    },
    {
      name: t("stockManagementExpiredStock", "Expired Stock"),
      link: "#",
      //TODO: Add component
    },
    {
      name: t("stockManagementTransactionHistory", "Transaction History"),
      link: "#",
      //TODO: Add component
    },
    {
      name: t("stockManagementSettings", "Settings"),
      link: "#",
      //TODO: Add component
    },
  ];

  return <SideNavItemsList tabs={tabs} selectedIndex={selectedTab} />;
};

export default StockManagementDashboardItems;
