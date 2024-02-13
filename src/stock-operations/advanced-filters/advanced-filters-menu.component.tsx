import { Filter } from "@carbon/react/icons";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { OverflowMenu, OverflowMenuItem } from "@carbon/react";

interface AdvancedFiltersListProps {
  onFilterSelect: (
    config: {
      type: boolean;
      status: boolean;
      date: boolean;
    },
    header: string
  ) => void;
}

const AdvancedFiltersList: React.FC<AdvancedFiltersListProps> = ({
  onFilterSelect,
}) => {
  const { t } = useTranslation();

  const advancedFiltersMenu = useMemo(
    () => [
      {
        key: "filterByType",
        label: t("filterByType", "Filter by Type"),
        header: t("filterByType", "Filter by Type"),
        action: () =>
          onFilterSelect(
            { type: true, status: false, date: false },
            t("filterByType", "Filter by Type")
          ),
      },
      {
        key: "filterByStatus",
        label: t("filterByStatus", "Filter by Status"),
        header: t("filterByStatus", "Filter by Status"),
        action: () =>
          onFilterSelect(
            { type: false, status: true, date: false },
            t("filterByStatus", "Filter by Status")
          ),
      },
      {
        key: "filterByDate",
        label: t("filterByDate", "Filter by Date"),
        header: t("filterByDate", "Filter by Date"),
        action: () =>
          onFilterSelect(
            { type: false, status: false, date: true },
            t("filterByDate", "Filter by Date")
          ),
      },
    ],
    [t, onFilterSelect]
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
