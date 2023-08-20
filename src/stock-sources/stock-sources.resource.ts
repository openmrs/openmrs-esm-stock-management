import { openmrsFetch } from "@openmrs/esm-framework";
import { ResourceFilterCriteria, toQueryParams } from "../core/api/api";
import useSWR from "swr";
import { PageableResult } from "../core/api/types/PageableResult";
import { StockSource } from "../core/api/types/stockOperation/StockSource";

export interface StockSourceFilter extends ResourceFilterCriteria {
  sourceTypeUuid?: string | null;
}

// getStockSources
export function useStockSources(filter: StockSourceFilter) {
  const apiUrl = `ws/rest/v1/stockmanagement/stocksource${toQueryParams(
    filter
  )}`;

  const { data, error, isLoading } = useSWR<
    { data: PageableResult<StockSource> },
    Error
  >(apiUrl, openmrsFetch);

  return {
    items: data.data ? data.data : [],
    isLoading,
    isError: error,
  };
}

// getStockSource
export function useStockSource(id: string) {
  const apiUrl = `ws/rest/v1/stockmanagement/stocksource/${id}`;
  const { data, error, isLoading } = useSWR<{ data: StockSource }, Error>(
    apiUrl,
    openmrsFetch
  );
  return {
    items: data.data ? data.data : [],
    isLoading,
    isError: error,
  };
}

// deleteStockSources
export function deleteStockSource(ids: string[]) {
  let otherIds = ids.reduce((p, c, i) => {
    if (i === 0) return p;
    p += (p.length > 0 ? "," : "") + encodeURIComponent(c);
    return p;
  }, "");
  if (otherIds.length > 0) {
    otherIds = "?ids=" + otherIds;
  }
  const apiUrl = `ws/rest/v1/stockmanagement/stocksource/${ids[0]}${otherIds}`;
  const abortController = new AbortController();
  return openmrsFetch(apiUrl, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    signal: abortController.signal,
  });
}

// createOrUpdateStockSource
export function createOrUpdateStockSource(item: StockSource) {
  const isNew = item.uuid != null;

  const apiUrl = `ws/rest/v1/stockmanagement/stocksource${
    isNew ? "/" + item.uuid : ""
  }`;
  const abortController = new AbortController();
  return openmrsFetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    signal: abortController.signal,
    body: { ...item, sourceType: item?.sourceType?.uuid },
  });
}
