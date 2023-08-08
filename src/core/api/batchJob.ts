import { BASE_OPENMRS_APP_URL } from "../../constants";
import { ReportType } from "../../stock-reports/stock-report-type";
import { ResourceFilterCriteria, api, toQueryParams } from "./api";
import { BatchJobsTag, LIST_ID, ReportsTag } from "./tagTypes";
import { BatchJob, BatchJobType } from "./types/BatchJob";
import { PageableResult } from "./types/PageableResult";

export interface BatchJobFilter extends ResourceFilterCriteria {
  batchJobType?: BatchJobType | null | undefined;
  status?: string | null;
  locationScopeUuid?: string | null;
  dateCreatedMin?: string | null | undefined;
  dateCreatedMax?: string | null | undefined;
  completedDateMin?: string | null | undefined;
  completedDateMax?: string | null | undefined;
}

const batchJobsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getBatchJobs: build.query<PageableResult<BatchJob>, BatchJobFilter>({
      query: (filter) => ({
        url: `${BASE_OPENMRS_APP_URL}ws/rest/v1/stockmanagement/batchjob${toQueryParams(
          filter
        )}`,
        method: "GET",
      }),
      providesTags: (_result, _err, id) => {
        return [{ type: BatchJobsTag, id: LIST_ID }];
      },
    }),
    cancelBatchJobs: build.mutation<void, string[]>({
      query: (ids) => {
        let otherIds = ids.reduce((p, c, i) => {
          if (i === 0) return p;
          p += (p.length > 0 ? "," : "") + encodeURIComponent(c);
          return p;
        }, "");
        if (otherIds.length > 0) {
          otherIds = "?ids=" + otherIds;
        }
        return {
          url: `${BASE_OPENMRS_APP_URL}ws/rest/v1/stockmanagement/batchjob/${ids[0]}${otherIds}`,
          method: "DELETE",
        };
      },
      invalidatesTags: (_result, _err, id) => {
        return [{ type: BatchJobsTag }];
      },
    }),
    createBatchJob: build.mutation<void, BatchJob>({
      query: (stockItem) => {
        return {
          url: `${BASE_OPENMRS_APP_URL}ws/rest/v1/stockmanagement/batchjob`,
          method: "POST",
          body: stockItem,
        };
      },
      invalidatesTags: (_result, _err, id) => {
        return [{ type: BatchJobsTag }];
      },
    }),
    getReportTypes: build.query<PageableResult<ReportType>, void>({
      query: (filter) => ({
        url: `${BASE_OPENMRS_APP_URL}ws/rest/v1/stockmanagement/report?v=default`,
        method: "GET",
      }),
      providesTags: (_result, _err, id) => {
        return [{ type: ReportsTag, id: LIST_ID }];
      },
      transformResponse: (response: PageableResult<ReportType>, meta, arg) => {
        response?.results?.sort((a, b) =>
          (a?.name ?? "")?.localeCompare(b?.name ?? "")
        );
        return response;
      },
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetBatchJobsQuery,
  useLazyGetBatchJobsQuery,
  useCancelBatchJobsMutation,
  useCreateBatchJobMutation,
  useGetReportTypesQuery,
} = batchJobsApi;
