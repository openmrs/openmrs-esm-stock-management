import { StockOperationFilter } from "../stock-operations/stock-operations.resource";
import { useMemo, useState } from "react";
import { usePagination } from "@openmrs/esm-framework";
import { useTranslation } from "react-i18next";
import { useStockLocations } from "../stock-lookups/stock-lookups.resource";

export function useStockLocationPages(filter: StockOperationFilter) {
  const { locations, isErrorLocation, isLoadingLocations } =
    useStockLocations(filter);

  const pageSizes = [10, 20, 30, 40, 50];
  const [currentPageSize, setPageSize] = useState(10);

  const {
    goTo,
    results: paginatedQueueEntries,
    currentPage,
  } = usePagination(locations.results, currentPageSize);

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
    return locations?.results?.map((location) => ({
      id: location?.uuid,
      key: `key-${location?.uuid}`,
      uuid: `${location?.uuid}`,
      name: `${location?.name}`,
      tags: location?.tags?.map((p) => p.display)?.join(", ") ?? "",
      childLocations:
        location?.childLocations?.map((p) => p.display)?.join(", ") ?? "",
    }));
  }, [locations?.results]);

  return {
    items: locations.results,
    currentPage,
    currentPageSize,
    paginatedQueueEntries,
    goTo,
    pageSizes,
    isLoadingLocations,
    isErrorLocation,
    setPageSize,
    tableHeaders,
    tableRows,
  };
}
