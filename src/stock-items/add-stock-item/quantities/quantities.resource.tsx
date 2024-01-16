import { ResourceRepresentation } from "../../../core/api/api";
import { useEffect, useMemo, useState } from "react";
import {
  StockItemInventoryFilter,
  useStockItemInventory,
} from "../../stock-items.resource";

export function useStockItemQuantitiesHook(v?: ResourceRepresentation) {
  const [stockItemFilter, setStockItemFilter] =
    useState<StockItemInventoryFilter>({
      startIndex: 0,
      v: v || ResourceRepresentation.Default,
      limit: 10,
      q: null,
      totalCount: true,
    });

  const pageSizes = [10, 20, 30, 40, 50];
  const [currentPageSize, setPageSize] = useState(10);
  const [searchString, setSearchString] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);

  const [stockItemUuid, setStockItemUuid] = useState<string | null>();
  const [partyUuid, setPartyUuid] = useState<string | null>();
  const [locationUuid, setLocationUuid] = useState<string | null>();
  const [stockBatchUuid, setStockBatchUuid] = useState<string | null>();

  useEffect(() => {
    setStockItemFilter({
      startIndex: currentPage - 1,
      v: ResourceRepresentation.Default,
      limit: currentPageSize,
      q: searchString,
      totalCount: true,
      stockItemUuid: stockItemUuid,
      partyUuid: partyUuid,
      locationUuid: locationUuid,
      stockBatchUuid: stockBatchUuid,
    });
  }, [
    searchString,
    currentPage,
    currentPageSize,
    stockItemUuid,
    partyUuid,
    locationUuid,
    stockBatchUuid,
  ]);

  const { items, isLoading, isError } = useStockItemInventory(stockItemFilter);

  const tableHeaders = useMemo(
    () => [
      {
        key: "location",
        header: "Location",
      },
      {
        key: "quantity",
        header: "Quantity",
      },
      {
        key: "packaging",
        header: "Packaging Unit",
      },
    ],
    []
  );

  return {
    items: items.results ?? [],
    totalCount: items.totalCount,
    currentPage,
    currentPageSize,
    setCurrentPage,
    setPageSize,
    pageSizes,
    isLoading,
    isError,
    setSearchString,
    tableHeaders,
    setStockItemUuid,
    setLocationUuid,
    setPartyUuid,
    setStockBatchUuid,
  };
}
