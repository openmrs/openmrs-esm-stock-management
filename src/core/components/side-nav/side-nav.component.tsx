import React from "react";
import { SideNavItem } from "./types";
import {
  SideNav,
  SideNavItems,
  SideNavLink,
} from "@carbon/react";
import styles from "./side-nav.scss";
import { navigate } from "@openmrs/esm-framework";

interface VerticalTabsProps {
  tabs: SideNavItem[];
  title?: string;
  hasContainer?: boolean;
  selectedIndex?: number;
  onChange?: (index: number) => void;
}

const SideNavItemsList: React.FC<VerticalTabsProps> = ({
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
        <SideNav
          isFixedNav
          expanded={true}
          isChildOfHeader={true}
          aria-label="Side navigation"
        >
          <SideNavItems>
            {tabs.map((tab: SideNavItem, index: number) => (
              <SideNavLink
                onClick={() =>
                  navigate({ to: `${window.getOpenmrsSpaBase()}stock-management/${tab.link}` })
                }
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
