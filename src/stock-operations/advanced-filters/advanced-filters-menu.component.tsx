import { Filter } from "@carbon/react/icons";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { OverflowMenu, OverflowMenuItem } from "@carbon/react";

const AdvancedFiltersList = () => {
  const { t } = useTranslation();

  const advancedFiltersMenu = useMemo(
    () => [
      {
        label: t("filterByType", "Filter by Type"),
        action: () => console.info("Filter by Type"),
      },
      {
        label: t("filterByStatus", "Filter by Status"),
        action: () => console.info("Filter by Status"),
      },
      {
        label: t("filterByDate", "Filter by Date"),
        action: () => console.info("Filter by Date"),
      },
    ],
    [t]
  );

  return (
    <OverflowMenu
      renderIcon={() => (
        <>
          Advanced Filters&nbsp;&nbsp;
          <Filter size={16} />
        </>
      )}
      menuOffset={{ right: "-100px" }}
      style={{
        backgroundColor: "#007d79",
        backgroundImage: "none",
        color: "#fff",
        minHeight: "1rem",
        padding: ".95rem !important",
        width: "auto",
        marginRight: "0.5rem",
        whiteSpace: "nowrap",
      }}
      align="bottom"
    >
      {advancedFiltersMenu.map((filterOption, index) => (
        <OverflowMenuItem
          key={index}
          itemText={filterOption.label}
          onClick={filterOption.action}
        />
      ))}
    </OverflowMenu>
  );
};

export default AdvancedFiltersList;
