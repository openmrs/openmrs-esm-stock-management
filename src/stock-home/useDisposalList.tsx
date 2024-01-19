import {
  StockOperationFilter,
  useStockOperations,
} from "../stock-operations/stock-operations.resource";

export function useDisposalList(filter: StockOperationFilter) {
  const { items, isLoading, isError } = useStockOperations(filter);

  const receivedItems = items?.results?.filter(
    (item) => item?.operationType === "disposed"
  );

  return {
    items: receivedItems,
    isLoading,
    isError,
  };
}
