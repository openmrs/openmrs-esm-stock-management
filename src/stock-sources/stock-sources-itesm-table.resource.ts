import { useStockSources } from "./stock-sources.resource";
import { useMemo, useState } from "react";
import { usePagination } from "@openmrs/esm-framework";
import { StockOperationFilter } from "../stock-operations/stock-operations.resource";

export default function useStockSourcesPage(filter: StockOperationFilter) {
  const { items, isLoading, isError } = useStockSources(filter);

  const pageSizes = [10, 20, 30, 40, 50];
  const [currentPageSize, setPageSize] = useState(10);
  const {
    goTo,
    results: paginatedItems,
    currentPage,
  } = usePagination(items.results, currentPageSize);

  const tableHeaders = useMemo(
    () => [
      {
        id: 0,
        header: "uuid",
        key: "uuid",
      },

      {
        id: 1,
        header: "name",
        key: "name",
      },
      {
        id: 2,
        header: "Acronym",
        key: "acronym",
      },
      {
        id: 3,
        header: "Source Type",
        key: "sourceType",
      },
    ],
    []
  );

  const tableRows = useMemo(() => {
    return paginatedItems?.map((entry) => {
      return {
        ...entry,
        id: entry?.uuid,
        key: `key-${entry?.uuid}`,
        uuid: entry?.uuid,
        name: entry?.name,
        acronym: entry?.acronym,
        sourceType: entry?.sourceType?.display,
      };
    });
  }, [paginatedItems]);

  return {
    items: items.results,
    currentPage,
    currentPageSize,
    paginatedItems,
    goTo,
    pageSizes,
    isLoading,
    isError,
    setPageSize,
    tableHeaders,
    tableRows,
  };
}
