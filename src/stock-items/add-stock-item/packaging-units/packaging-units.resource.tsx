import { ResourceRepresentation } from "../../../core/api/api";
import { useEffect, useMemo, useState } from "react";
import {
  StockItemInventoryFilter,
  useStockItemPackagingUOMs,
} from "../../stock-items.resource";

export function useStockItemPackageUnitsHook(v?: ResourceRepresentation) {
  const [stockItemFilter, setStockItemFilter] =
    useState<StockItemInventoryFilter>({
      startIndex: 0,
      v: v || ResourceRepresentation.Default,
      q: null,
      totalCount: true,
    });

  const [stockItemUuid, setStockItemUuid] = useState<string | null>();

  useEffect(() => {
    setStockItemFilter({
      startIndex: 0,
      v: ResourceRepresentation.Default,
      totalCount: true,
      stockItemUuid: stockItemUuid,
    });
  }, [stockItemUuid]);

  const { items, isLoading, isError } =
    useStockItemPackagingUOMs(stockItemFilter);

  const tableHeaders = useMemo(
    () => [     
      {
        key: "packaging",
        header: "Packaging Unit",
        styles: { width: "50%" },
      },
      {
        key: "quantity",
        header: "Quantity",
        styles: { width: "50%" },
      },
    ],
    []
  );

  return {
    items: items.results,
    totalCount: items.totalCount,
    isLoading,
    isError,
    tableHeaders,
    setStockItemUuid,
  };
}
