import {
  StockOperationFilter,
  useStockOperations,
} from "../stock-operations/stock-operations.resource";

export function useStockIssuing(filter: StockOperationFilter) {
  const { items, isLoading, isError } = useStockOperations(filter);

  const receivedItems = items?.results?.filter(
    (item) =>
      item?.operationType === "stockissue" && item?.status !== "COMPLETED"
  );
  return {
    items: receivedItems,
    isLoading,
    isError,
  };
}
