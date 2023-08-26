import React from "react";
import { Tab, TabList, TabPanel, TabPanels, Tabs } from "@carbon/react";
import StockItems from "../stock-items/stock-items.component";
import StockSources from "../stock-sources/stock-sources.component";
import StockUserScopes from "../stock-user-role-scopes/stock-user-role-scopes.component";
import StockLocations from "../stock-locations/stock-locations-table.component";
import StockOperations from "../stock-operations/stock-operations-table.component";
import styles from "./commodity-tabs.scss";

const StockCommodityTabs: React.FC = () => {
  return (
    <div className={styles.tabContainer}>
      <Tabs>
        <TabList contained fullWidth>
          <Tab>Items</Tab>
          <Tab>Operations</Tab>
          <Tab>Role scopes</Tab>
          <Tab>Sources</Tab>
          <Tab>Locations</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <StockItems />
          </TabPanel>
          <TabPanel>
            <StockOperations />
          </TabPanel>
          <TabPanel>
            <StockUserScopes />
          </TabPanel>
          <TabPanel>
            <StockSources />
          </TabPanel>
          <TabPanel>
            <StockLocations />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  );
};

export default StockCommodityTabs;
