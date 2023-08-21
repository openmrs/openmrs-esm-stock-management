import { StockOperationFilter } from "../stock-operations/stock-operations.resource";
import { useStockItems } from "./stock-items.resource";
import { useMemo, useState } from "react";
import { usePagination } from "@openmrs/esm-framework";
import { useTranslation } from "react-i18next";

export function useStockItemsPages(filter: StockOperationFilter) {
  const { items, isLoading, isError } = useStockItems(filter);
  const { t } = useTranslation();

  const pageSizes = [10, 20, 30, 40, 50];
  const [currentPageSize, setPageSize] = useState(10);

  const {
    goTo,
    results: paginatedQueueEntries,
    currentPage,
  } = usePagination(items.results, currentPageSize);

  const tableHeaders = useMemo(
    () => [
      {
        id: 0,
        header: t("type", "Type"),
        key: "type",
      },
      {
        id: 1,
        header: t("genericName", "Generic Name"),
        key: "genericName",
      },
      {
        id: 2,
        header: t("commonName", "Common Name"),
        key: "commonName",
      },
      {
        id: 3,
        header: t("tradeName", "Trade Name"),
        key: "tradeName",
      },
      {
        id: 4,
        header: t("dispensingUnitName", "Dispensing UoM"),
        key: "dispensingUnitName",
      },
      {
        id: 5,
        header: t("defaultStockOperationsUoMName", "Bulk Packaging"),
        key: "defaultStockOperationsUoMName",
      },
      {
        id: 6,
        header: t("reorderLevel", "Reorder Level"),
        key: "reorderLevel",
      },
      // { key: "details", header: "" },
    ],
    [t]
  );

  return {
    items: items.results,
    currentPage,
    currentPageSize,
    paginatedQueueEntries,
    goTo,
    pageSizes,
    isLoading,
    isError,
    setPageSize,
    tableHeaders,
  };
}
