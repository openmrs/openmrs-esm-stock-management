import { ResourceRepresentation } from '../core/api/api';
import { useEffect, useMemo, useState } from 'react';
import {
  StockBatchFilter,
  StockItemInventoryFilter,
  useStockBatches,
  useStockItemInventory,
} from '../stock-items/stock-items.resource';

export function useStockInventory() {
  const [stockItemFilter, setStockItemFilter] = useState<StockBatchFilter>({
    startIndex: 0,
    v: ResourceRepresentation.Default,
    q: null,
    includeStockItemName: 'true',
  });

  useEffect(() => {
    setStockItemFilter({
      v: ResourceRepresentation.Default,
      includeStockItemName: 'true',
    });
  }, []);

  const { items, isLoading, error } = useStockBatches(stockItemFilter);

  return {
    items: items.results ?? [],
    isLoading,
    error,
  };
}
