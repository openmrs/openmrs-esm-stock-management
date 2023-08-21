import { StockOperationFilter } from "../stock-operations/stock-operations.resource";
import { useMemo, useState } from "react";
import { usePagination } from "@openmrs/esm-framework";
import { useTranslation } from "react-i18next";
import { useLocations } from "../stock-lookups/stock-lookups.resource";

export function useStockLocationPages(filter: StockOperationFilter) {
  const { items, isLoading, isError } = useLocations(filter);

  const pageSizes = [10, 20, 30, 40, 50];
  const [currentPageSize, setPageSize] = useState(10);

  const {
    goTo,
    results: paginatedQueueEntries,
    currentPage,
  } = usePagination(items.results, currentPageSize);

  const { t } = useTranslation();

  const tableHeaders = useMemo(
    () => [
      {
        id: 0,
        header: t("name", "Name"),
        key: "name",
      },
      {
        id: 1,
        header: t("tags", "Tags"),
        key: "tags",
      },
      {
        id: 2,
        header: t("childLocations", "Child Locations"),
        key: "childLocations",
      },
      {
        id: 3,
        header: t("actions", "Actions"),
        key: "actions",
      },
    ],
    [t]
  );

  const tableRows = useMemo(() => {
    return items?.results?.map((location) => ({
      id: location?.uuid,
      key: `key-${location?.uuid}`,
      uuid: `${location?.uuid}`,
      name: `${location?.name}`,
      tags: location?.tags?.map((p) => p.display)?.join(", ") ?? "",
      childLocations:
        location?.childLocations?.map((p) => p.display)?.join(", ") ?? "",
    }));
  }, [items?.results, t]);

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
    tableRows,
  };
}
