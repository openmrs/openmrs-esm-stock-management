import { StockItemFilter, useStockItems } from "./stock-items.resource";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ResourceRepresentation } from "../core/api/api";
import { usePagination } from "@openmrs/esm-framework";

export function useStockItemsPages(v?: ResourceRepresentation) {
  const { t } = useTranslation();

  const pageSizes = [10, 20, 30, 40, 50];
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageSize, setPageSize] = useState(10);
  const [searchString, setSearchString] = useState(null);

  // Drug filter type
  const [isDrug, setDrug] = useState("");

  const [stockItemFilter, setStockItemFilter] = useState<StockItemFilter>({
    startIndex: currentPage - 1,
    v: v || ResourceRepresentation.Default,
    limit: 10,
    q: null,
    totalCount: true,
  });

  const { items, isLoading, isError } = useStockItems(stockItemFilter);

  const pagination = usePagination(items.results, currentPageSize);

  useEffect(() => {
    setStockItemFilter({
      startIndex: currentPage - 1,
      v: ResourceRepresentation.Default,
      limit: currentPageSize,
      q: searchString,
      totalCount: true,
      isDrug: isDrug,
    });
  }, [searchString, currentPage, currentPageSize, isDrug]);

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
      {
        id: 7,
        key: "actions",
        header: "Actions",
      },
    ],
    [t]
  );

  return {
    items: pagination.results,
    pagination,
    totalCount: items.totalCount,
    currentPageSize,
    currentPage,
    setCurrentPage,
    setPageSize,
    pageSizes,
    isLoading,
    isError,
    isDrug,
    setDrug: (drug: string) => {
      setCurrentPage(1);
      setDrug(drug);
    },
    setSearchString,
    tableHeaders,
  };
}
