import { Tab, TabList, TabPanel, TabPanels, Tabs } from "@carbon/react";
import React from "react";
import styles from "./commodity-tabs.scss";
import StockItems from "../stock-items/stock-items.component";

const StockCommodityTabs: React.FC = () => {
  return (
    <div className={styles.tabContainer}>
      <Tabs>
        <TabList contained>
          <Tab> Stock Items</Tab>
          <Tab> Stock Operations</Tab>
          <Tab> Stock User Role Scopes</Tab>
          <Tab> Stock Locations</Tab>
          <Tab> Stock Reports</Tab>
          <Tab> Stock Settings</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <StockItems />
          </TabPanel>
          <TabPanel>
            <StockItems />
          </TabPanel>{" "}
          <TabPanel>
            <StockItems />
          </TabPanel>{" "}
          <TabPanel>
            <StockItems />
          </TabPanel>{" "}
          <TabPanel>
            <StockItems />
          </TabPanel>{" "}
          <TabPanel>
            <StockItems />
          </TabPanel>{" "}
          <TabPanel>
            <StockItems />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  );
};

export default StockCommodityTabs;
