import React from "react";
import { SideNavItem } from "./types";
import {
  SideNav,
  SideNavItems,
  SideNavLink,
} from "@carbon/react";
import styles from "./side-nav.scss";
import { navigate } from "@openmrs/esm-framework";

interface SideNavProps {
  tabs: SideNavItem[];
  selectedIndex?: number;
  onSelectTab: (index: number) => void;
}

const SideNavItemsList: React.FC<SideNavProps> = ({
  tabs,
  selectedIndex,
  onSelectTab,
}) => {
  return (
    <div
      className={`
        ${styles.cohortBuilder}
      `}
    >
      <div className={styles.tab}>
        <SideNav
          isFixedNav
          expanded={true}
          isChildOfHeader={true}
          aria-label="Side navigation"
        >
          <SideNavItems>
            {tabs.map((tab: SideNavItem, index: number) => (
              <SideNavLink
                key={index}
                isActive={index === selectedIndex}
                onClick={() => {
                  onSelectTab(index); // Call onSelectTab to update selectedTab in the parent
                  navigate({
                    to: `${window.getOpenmrsSpaBase()}stock-management/${tab.link}`,
                  });
                }}
              >
                {tab.name}
              </SideNavLink>
            ))}
          </SideNavItems>
        </SideNav>
      </div>
    </div>
  );
};

export default SideNavItemsList;
