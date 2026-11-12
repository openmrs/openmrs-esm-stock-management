import useSWR from 'swr';
import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { type PageableResult } from '../core/api/types/PageableResult';
import { LocationStockItemBatchNo, type StockItemDTO } from '../core/api/types/stockItem/StockItem';
import { type StockItemInventory } from '../core/api/types/stockItem/StockItemInventory';
import { buildStockInventoryRow, type StockInventoryRow } from './stock-home.utils';
import { useStockInventoryItems } from './stock-home-inventory-items.resource';

const INVENTORY_BATCH_SIZE = 10;

async function fetchStockItemInventory(stockItem: StockItemDTO) {
  const response = await openmrsFetch<PageableResult<StockItemInventory>>(
    `${restBaseUrl}/stockmanagement/stockiteminventory?stockItemUuid=${stockItem.uuid}&v=default&includeBatchNo=true&includeStockItemName=true&groupBy=${LocationStockItemBatchNo}&excludeExpired=false`,
  );

  return (response.data?.results ?? []).map((inventory) => buildStockInventoryRow(stockItem, inventory));
}

async function fetchInventoryForStockItems(stockItems: StockItemDTO[]) {
  const inventoryRows: StockInventoryRow[] = [];

  for (let index = 0; index < stockItems.length; index += INVENTORY_BATCH_SIZE) {
    const batches = await Promise.all(
      stockItems.slice(index, index + INVENTORY_BATCH_SIZE).map(fetchStockItemInventory),
    );
    inventoryRows.push(...batches.flat());
  }

  return inventoryRows;
}

export function useStockInventory() {
  const { items: stockItems, isLoading: stockItemsLoading, error: stockItemsError } = useStockInventoryItems();
  const stockItemUuids = stockItems.map((stockItem) => stockItem.uuid).filter(Boolean);
  const { data, isLoading, error } = useSWR(
    stockItemUuids.length ? ['stockInventory', stockItemUuids.join(',')] : null,
    () => fetchInventoryForStockItems(stockItems),
  );

  return {
    items: data ?? [],
    isLoading: stockItemsLoading || isLoading,
    error: stockItemsError || error,
  };
}
