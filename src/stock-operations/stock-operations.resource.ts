import { openmrsFetch } from "@openmrs/esm-framework";
import useSWR from "swr";
import { ResourceFilterCriteria, toQueryParams } from "../core/api/api";
import { PageableResult } from "../core/api/types/PageableResult";
import { StockOperationDTO } from "../core/api/types/stockOperation/StockOperationDTO";
import { StockOperationLinkDTO } from "../core/api/types/stockOperation/StockOperationLinkDTO";
import { StopOperationAction } from "../core/api/types/stockOperation/StockOperationAction";

export interface StockOperationFilter extends ResourceFilterCriteria {
  status?: string | null | undefined;
  operationTypeUuid?: string | null | undefined;
  locationUuid?: string | null | undefined;
  isLocationOther?: boolean | null | undefined;
  stockItemUuid?: string | null | undefined;
  operationDateMin?: string | null | undefined;
  operationDateMax?: string | null | undefined;
  sourceTypeUuid?: string | null | undefined;
}

// getStockOperations
export function useStockOperations(filter: StockOperationFilter) {
  const apiUrl = `ws/rest/v1/stockmanagement/stockoperation${toQueryParams(
    filter
  )}`;
  const { data, error, isLoading } = useSWR<
    { data: PageableResult<StockOperationDTO> },
    Error
  >(apiUrl, openmrsFetch);

  return {
    items: data?.data || <PageableResult<StockOperationDTO>>{},
    isLoading,
    isError: error,
  };
}

// getStockOperationLinks
export function useStockOperationLinks(filter: string) {
  const apiUrl = `ws/rest/v1/stockmanagement/stockoperationlink?v=default&q=${filter}`;
  const { data, error, isLoading } = useSWR<
    { data: PageableResult<StockOperationLinkDTO> },
    Error
  >(apiUrl, openmrsFetch);
  return {
    items: data.data ? data.data : [],
    isLoading,
    isError: error,
  };
}

// getStockOperation
export function useStockOperation(id: string) {
  const apiUrl = `ws/rest/v1/stockmanagement/stockoperation/${id}`;
  const { data, error, isLoading } = useSWR<{ data: StockOperationDTO }, Error>(
    apiUrl,
    openmrsFetch
  );
  return {
    items: data.data ? data.data : {},
    isLoading,
    isError: error,
  };
}

// getStockOperationAndItems
export function useStockOperationAndItems(id: string) {
  const apiUrl = `ws/rest/v1/stockmanagement/stockoperation/${id}?v=full`;
  const { data, error, isLoading } = useSWR<{ data: StockOperationDTO }, Error>(
    apiUrl,
    openmrsFetch
  );
  return {
    items: data.data ? data.data : {},
    isLoading,
    isError: error,
  };
}

// deleteStockOperations
export function deleteStockOperations(ids: string[]) {
  let otherIds = ids.reduce((p, c, i) => {
    if (i === 0) return p;
    p += (p.length > 0 ? "," : "") + encodeURIComponent(c);
    return p;
  }, "");
  if (otherIds.length > 0) {
    otherIds = "?ids=" + otherIds;
  }
  const apiUrl = `ws/rest/v1/stockmanagement/stockoperation/${ids[0]}${otherIds}`;
  const abortController = new AbortController();
  return openmrsFetch(apiUrl, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    signal: abortController.signal,
  });
}

// deleteStockOperationItem
export function deleteStockOperationItem(id: string) {
  const apiUrl = `ws/rest/v1/stockmanagement/stockoperationitem/${id}`;
  const abortController = new AbortController();
  return openmrsFetch(apiUrl, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    signal: abortController.signal,
  });
}

// createStockOperation
export function createStockOperation(item: StockOperationDTO) {
  const apiUrl = `ws/rest/v1/stockmanagement/stockoperation`;
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

// updateStockOperation
export function updateStockOperation(item: StockOperationDTO) {
  const apiUrl = `ws/rest/v1/stockmanagement/stockoperation/${item.uuid}`;
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

// executeStockOperationAction
export function executeStockOperationAction(item: StopOperationAction) {
  const apiUrl = `ws/rest/v1/stockmanagement/stockoperationaction`;
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

// updateStockOperationBatchNumbers
export function updateStockOperationBatchNumbers(
  item: StockOperationDTO,
  uuid: string
) {
  const apiUrl = `ws/rest/v1/stockmanagement/stockoperationbatchnumbers/${uuid}`;
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
