import useSWR from "swr";
import { ResourceFilterCriteria, toQueryParams } from "../core/api/api";
import { BatchJob, BatchJobType } from "../core/api/types/BatchJob";
import { PageableResult } from "../core/api/types/PageableResult";
import { openmrsFetch, restBaseUrl } from "@openmrs/esm-framework";
import { ReportType } from "../stock-reports/ReportType";

export interface BatchJobFilter extends ResourceFilterCriteria {
  batchJobType?: BatchJobType | null | undefined;
  status?: string | null;
  locationScopeUuid?: string | null;
  dateCreatedMin?: string | null | undefined;
  dateCreatedMax?: string | null | undefined;
  completedDateMin?: string | null | undefined;
  completedDateMax?: string | null | undefined;
}

// getBatchJobs
export function useBatchJobs(filter: BatchJobFilter) {
  const apiUrl = `${restBaseUrl}/stockmanagement/batchjob${toQueryParams(
    filter
  )}`;
  const { data, error, isLoading } = useSWR<
    { data: PageableResult<BatchJob> },
    Error
  >(apiUrl, openmrsFetch);

  return {
    items: data.data ? data.data : [],
    isLoading,
    isError: error,
  };
}

// cancelBatchJobs
export function cancelBatchJobs(ids: string[]) {
  let otherIds = ids.reduce((p, c, i) => {
    if (i === 0) return p;
    p += (p.length > 0 ? "," : "") + encodeURIComponent(c);
    return p;
  }, "");
  if (otherIds.length > 0) {
    otherIds = "?ids=" + otherIds;
  }
  const apiUrl = `${restBaseUrl}/stockmanagement/batchjob/${ids[0]}${otherIds}`;
  const abortController = new AbortController();
  return openmrsFetch(apiUrl, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    signal: abortController.signal,
  });
}

// createBatchJob
export function createBatchJob(item: BatchJob) {
  const apiUrl = `${restBaseUrl}/stockmanagement/batchjob`;
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
// getReportTypes
export function useReportTypes() {
  const apiUrl = `${restBaseUrl}/stockmanagement/report?v=default`;
  const { data, error, isLoading } = useSWR<
    { data: PageableResult<ReportType> },
    Error
  >(apiUrl, openmrsFetch);
  return {
    items: data.data ? data.data : [],
    isLoading,
    isError: error,
  };
}
