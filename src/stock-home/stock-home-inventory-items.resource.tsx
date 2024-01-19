import { StockItemFilter, useStockItems } from "../stock-items/stock-items.resource";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ResourceRepresentation } from "../core/api/api";
export function useStockInventoryItems(v?: ResourceRepresentation) {
  const [stockItemFilter, setStockItemFilter] = useState<StockItemFilter>({
    v: v || ResourceRepresentation.Default,
    q: null,
    totalCount: true,
  });

  const { items, isLoading, isError } = useStockItems(stockItemFilter);
  console.log(items)

  useEffect(() => {
    setStockItemFilter({
      v: ResourceRepresentation.Default,
      totalCount: true,
    });
  }, []);

  return {
    items: items.results,
    isLoading,
    isError,
  };
}

