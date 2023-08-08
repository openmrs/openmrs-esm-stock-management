import { BASE_OPENMRS_APP_URL } from "../../constants";
import { api, ResourceFilterCriteria, toQueryParams } from "./api";
import { LIST_ID, StockSourcesTag } from "./tagTypes";
import { PageableResult } from "./types/PageableResult";
import { StockSource } from "./types/stockOperation/StockSource";

export interface StockSourceFilter extends ResourceFilterCriteria {
  sourceTypeUuid?: string | null;
}

const stockSourcesApi = api.injectEndpoints({
  endpoints: (build) => ({
    getStockSources: build.query<
      PageableResult<StockSource>,
      StockSourceFilter | null
    >({
      query: (filter) => ({
        url: `${BASE_OPENMRS_APP_URL}ws/rest/v1/stockmanagement/stocksource${toQueryParams(
          filter
        )}`,
        method: "GET",
      }),
      providesTags: (_result, _err, id) => {
        return [{ type: StockSourcesTag, id: LIST_ID }];
      },
      transformResponse: (response: PageableResult<StockSource>, meta, arg) => {
        response?.results?.sort((a, b) => a.name?.localeCompare(b.name));
        return response;
      },
    }),

    getStockSource: build.query<StockSource, string>({
      query: (id) => ({
        url: `${BASE_OPENMRS_APP_URL}ws/rest/v1/stockmanagement/stocksource/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _err, id) => {
        return [{ type: StockSourcesTag, id }];
      },
    }),
    deleteStockSources: build.mutation<void, string[]>({
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
          url: `${BASE_OPENMRS_APP_URL}ws/rest/v1/stockmanagement/stocksource/${ids[0]}${otherIds}`,
          method: "DELETE",
        };
      },
      invalidatesTags: (_result, _err, id) => {
        return [{ type: StockSourcesTag }];
      },
    }),
    createOrUpdateStockSource: build.mutation<void, StockSource>({
      query: (stockSource) => {
        var isNew = stockSource.uuid != null;
        return {
          url: `${BASE_OPENMRS_APP_URL}ws/rest/v1/stockmanagement/stocksource${
            isNew ? "/" + stockSource.uuid : ""
          }`,
          method: "POST",
          body: { ...stockSource, sourceType: stockSource?.sourceType?.uuid },
        };
      },
      invalidatesTags: (_result, _err, id) => {
        return [{ type: StockSourcesTag }];
      },
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetStockSourcesQuery,
  useDeleteStockSourcesMutation,
  useGetStockSourceQuery,
  useLazyGetStockSourceQuery,
  useCreateOrUpdateStockSourceMutation,
  useLazyGetStockSourcesQuery,
} = stockSourcesApi;
