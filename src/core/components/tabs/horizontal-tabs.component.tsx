import React from "react";
import { TabItem } from "./types";
import { Tab, TabList, TabPanel, TabPanels, Tabs } from "@carbon/react";
import styles from "./horizontal-tabs.scss";

interface HorizontalTabsProps {
  tabs: TabItem[];
  title?: string;
  hasContainer?: boolean;
  selectedIndex?: number;
  onChange?: (index: number) => void;
}

const HorizontalTabs: React.FC<HorizontalTabsProps> = ({
  tabs,
  title,
  hasContainer,
  selectedIndex,
  onChange,
}) => {
  return (
    <div
      className={`
        ${hasContainer ? styles.tabContainer : ""}
        ${styles.cohortBuilder}
      `}
    >
      {title && <p className={styles.heading}>{title}</p>}
      <div className={styles.tab}>
        <Tabs
          className={`${styles.verticalTabs}`}
          selectedIndex={selectedIndex}
          onChange={({ selectedIndex }) => onChange?.(selectedIndex)}
        >
          <TabList aria-label="navigation">
            {tabs.map((tab: TabItem, index: number) => (
              <Tab key={index} disabled={tab.disabled}>
                {tab.name}
              </Tab>
            ))}
          </TabList>
          <TabPanels>
            {tabs.map((tab: TabItem, index: number) => (
              <TabPanel key={index}>{tab.component}</TabPanel>
            ))}
          </TabPanels>
        </Tabs>
      </div>
    </div>
  );
};

export default HorizontalTabs;
