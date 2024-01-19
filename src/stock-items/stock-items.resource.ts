import { openmrsFetch } from "@openmrs/esm-framework";
import { ResourceFilterCriteria, toQueryParams } from "../core/api/api";
import { PageableResult } from "../core/api/types/PageableResult";
import {
  InventoryGroupBy,
  StockItemDTO,
} from "../core/api/types/stockItem/StockItem";
import { StockItemInventory } from "../core/api/types/stockItem/StockItemInventory";
import useSWR from "swr";
import { StockItemTransactionDTO } from "../core/api/types/stockItem/StockItemTransaction";
import { StockOperationItemCost } from "../core/api/types/stockOperation/StockOperationItemCost";
import { StockBatchDTO } from "../core/api/types/stockItem/StockBatchDTO";
import { StockItemPackagingUOMDTO } from "../core/api/types/stockItem/StockItemPackagingUOM";
import { StockRule } from "../core/api/types/stockItem/StockRule";

export interface StockItemFilter extends ResourceFilterCriteria {
  isDrug?: string | null | undefined;
  drugUuid?: string | null;
  conceptUuid?: string | null;
}

export interface StockItemTransactionFilter extends ResourceFilterCriteria {
  stockItemUuid?: string | null;
  partyUuid?: string | null;
  stockOperationUuid?: string | null;
  includeBatchNo?: boolean | null;
  dateMin?: string | null;
  dateMax?: string | null;
  stockBatchUuid?: string | null | undefined;
}

export interface StockItemInventoryFilter extends ResourceFilterCriteria {
  stockItemUuid?: string | null;
  partyUuid?: string | null;
  locationUuid?: string | null;
  includeBatchNo?: boolean | null;
  stockBatchUuid?: string | null;
  groupBy?: InventoryGroupBy | null;
  totalBy?: InventoryGroupBy | null;
  stockOperationUuid?: string | null;
  date?: string | null;
  includeStockItemName?: "true" | "false" | "0" | "1";
  excludeExpired?: boolean | null;
}

export interface StockItemPackagingUOMFilter extends ResourceFilterCriteria {
  stockItemUuid?: string | null | undefined;
}

export interface StockBatchFilter extends ResourceFilterCriteria {
  stockItemUuid?: string | null | undefined;
  excludeExpired?: boolean | null;
  includeStockItemName?: "true" | "false" | "0" | "1";
}

export interface StockInventoryResult
  extends PageableResult<StockItemInventory> {
  total: StockItemInventory[];
}

export interface StockRuleFilter extends ResourceFilterCriteria {
  stockItemUuid?: string | null;
  locationUuid?: string | null;
}

// getStockItems
export function useStockItems(filter: StockItemFilter) {
  const apiUrl = `ws/rest/v1/stockmanagement/stockitem${toQueryParams(filter)}`;
  const { data, error, isLoading } = useSWR<
    {
      data: PageableResult<StockItemDTO>;
    },
    Error
  >(apiUrl, openmrsFetch);

  return {
    items: data?.data || <PageableResult<StockItemDTO>>{},
    isLoading,
    isError: error,
  };
}

// getStockItemTransactions
export function useStockItemTransactions(filter: StockItemTransactionFilter) {
  const apiUrl = `ws/rest/v1/stockmanagement/stockitemtransaction${toQueryParams(
    filter
  )}`;
  const { data, error, isLoading } = useSWR<
    {
      data: PageableResult<StockItemTransactionDTO>;
    },
    Error
  >(apiUrl, openmrsFetch);

  return {
    items: data?.data || <PageableResult<StockItemTransactionDTO>>{},
    isLoading,
    isError: error,
  };
}

// getStockItemInventory
export function useStockItemInventory(filter: StockItemInventoryFilter) {
  const apiUrl = `ws/rest/v1/stockmanagement/stockiteminventory${toQueryParams(
    filter
  )}`;
  const { data, error, isLoading } = useSWR<
    {
      data: StockInventoryResult;
    },
    Error
  >(apiUrl, openmrsFetch);

  return {
    items: data?.data || <StockInventoryResult>{},
    isLoading,
    isError: error,
  };
}

// getStockOperationItemsCost
export function useStockOperationItemsCost(filter: string) {
  const apiUrl = `ws/rest/v1/stockmanagement/stockoperationitemcost?v=default&stockOperationUuid=${filter}`;
  const { data, error, isLoading } = useSWR<
    {
      data: PageableResult<StockOperationItemCost>;
    },
    Error
  >(apiUrl, openmrsFetch);
  return {
    items: data.data ? data.data : [],
    isLoading,
    isError: error,
  };
}

// getStockBatches
export function useStockBatches(filter: StockBatchFilter) {
  const apiUrl = `ws/rest/v1/stockmanagement/stockbatch${toQueryParams(
    filter
  )}`;
  const { data, error, isLoading } = useSWR<
    {
      data: PageableResult<StockBatchDTO>;
    },
    Error
  >(apiUrl, openmrsFetch);
  return {
    items: data?.data || <PageableResult<StockBatchDTO>>{},
    isLoading,
    isError: error,
  };
}

// getStockItemPackagingUOMs
export function useStockItemPackagingUOMs(filter: StockItemPackagingUOMFilter) {
  const apiUrl = `ws/rest/v1/stockmanagement/stockitempackaginguom${toQueryParams(
    filter
  )}`;
  const { data, error, isLoading } = useSWR<
    {
      data: PageableResult<StockItemPackagingUOMDTO>;
    },
    Error
  >(apiUrl, openmrsFetch);

  return {
    items: data?.data || <PageableResult<StockItemPackagingUOMDTO>>{},
    isLoading,
    isError: error,
  };
}

// getStockItem
export function useStockItem(id: string) {
  const apiUrl = `ws/rest/v1/stockmanagement/stockitem/${id}?v=full`;
  const { data, error, isLoading } = useSWR<
    {
      data: StockItemDTO;
    },
    Error
  >(apiUrl, openmrsFetch);
  return {
    item: data?.data || <StockItemDTO>{},
    isLoading,
    isError: error,
  };
}

// deleteStockItems
export function deleteStockItems(ids: string[]) {
  let otherIds = ids.reduce((p, c, i) => {
    if (i === 0) return p;
    p += (p.length > 0 ? "," : "") + encodeURIComponent(c);
    return p;
  }, "");
  if (otherIds.length > 0) {
    otherIds = "?ids=" + otherIds;
  }

  const apiUrl = `ws/rest/v1/stockmanagement/stockitem/${ids[0]}${otherIds}`;

  const abortController = new AbortController();

  return openmrsFetch(apiUrl, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    signal: abortController.signal,
  });
}

// deleteStockItemPackagingUnit
export function deleteStockItemPackagingUnit(id: string) {
  const apiUrl = `ws/rest/v1/stockmanagement/stockitempackaginguom/${id}`;
  const abortController = new AbortController();

  return openmrsFetch(apiUrl, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    signal: abortController.signal,
  });
}

// createStockItem
export function createStockItem(item: StockItemDTO) {
  const apiUrl = `ws/rest/v1/stockmanagement/stockitem`;
  const abortController = new AbortController();
  delete item.isDrug;
  return openmrsFetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    signal: abortController.signal,
    body: item,
  });
}

// updateStockItem
export function updateStockItem(item: StockItemDTO) {
  const apiUrl = `ws/rest/v1/stockmanagement/stockitem/${item.uuid}`;
  const abortController = new AbortController();
  delete item.isDrug;
  delete item.dateCreated;
  return openmrsFetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    signal: abortController.signal,
    body: item,
  });
}

// createStockItemPackagingUnit
export function createStockItemPackagingUnit(item: StockItemPackagingUOMDTO) {
  const apiUrl = `ws/rest/v1/stockmanagement/stockitempackaginguom`;
  const abortController = new AbortController();
  return openmrsFetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    signal: abortController.signal,
    body: item,
  });
}

// updateStockItemPackagingUnit
export function updateStockItemPackagingUnit(item: StockItemDTO, uuid: string) {
  const apiUrl = `ws/rest/v1/stockmanagement/stockitempackaginguom/${uuid}`;
  const abortController = new AbortController();
  return openmrsFetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    signal: abortController.signal,
    body: item,
  });
}

// importStockItem
export function importStockItem(item: FormData) {
  const apiUrl = `ws/rest/v1/stockmanagement/stockitemimport`;
  const abortController = new AbortController();
  return openmrsFetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    signal: abortController.signal,
    body: item,
  });
}

// stock rules
// getStockRules
export function useStockRules(filter: StockRuleFilter) {
  const apiUrl = `ws/rest/v1/stockmanagement/stockrule${toQueryParams(filter)}`;
  const { data, error, isLoading } = useSWR<
    {
      data: PageableResult<StockRule>;
    },
    Error
  >(apiUrl, openmrsFetch);

  return {
    items: data.data ? data.data : [],
    isLoading,
    isError: error,
  };
}

// createStockRule
export function createStockRule(item: StockRule) {
  const apiUrl = `ws/rest/v1/stockmanagement/stockrule`;
  const abortController = new AbortController();
  return openmrsFetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    signal: abortController.signal,
    body: item,
  });
}

// updateStockRule
export function updateStockRule(item: StockRule, uuid: string) {
  const apiUrl = `ws/rest/v1/stockmanagement/stockrule/${uuid}`;
  const abortController = new AbortController();
  return openmrsFetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    signal: abortController.signal,
    body: item,
  });
}

// deleteStockRule
export function deleteStockRule(id: string) {
  const apiUrl = `ws/rest/v1/stockmanagement/stockrule/${id}`;
  const abortController = new AbortController();
  return openmrsFetch(apiUrl, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    signal: abortController.signal,
  });
}
