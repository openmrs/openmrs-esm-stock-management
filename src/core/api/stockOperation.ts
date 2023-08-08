import { BASE_OPENMRS_APP_URL } from "../../constants";
import { api, ResourceFilterCriteria, toQueryParams } from "./api";
import {
  LIST_ID,
  StockOperationLinksTag,
  StockOperationsTag,
} from "./tagTypes";
import { PageableResult } from "./types/PageableResult";
import { StopOperationAction } from "./types/stockOperation/StockOperationAction";
import { StockOperationDTO } from "./types/stockOperation/StockOperationDTO";
import { StockOperationLinkDTO } from "./types/stockOperation/StockOperationLinkDTO";

export interface StockOperationFilter extends ResourceFilterCriteria {
  status?: string | null | undefined;
  operationTypeUuid?: string | null | undefined;
  locationUuid?: string | null | undefined;
  isLocationOther?: Boolean | null | undefined;
  stockItemUuid?: string | null | undefined;
  operationDateMin?: string | null | undefined;
  operationDateMax?: string | null | undefined;
  sourceTypeUuid?: string | null | undefined;
}

const stockOperationsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getStockOperations: build.query<
      PageableResult<StockOperationDTO>,
      StockOperationFilter
    >({
      query: (filter) => ({
        url: `${BASE_OPENMRS_APP_URL}ws/rest/v1/stockmanagement/stockoperation${toQueryParams(
          filter
        )}`,
        method: "GET",
      }),
      providesTags: (_result, _err, id) => {
        return [{ type: StockOperationsTag, id: LIST_ID }];
      },
      transformResponse: (
        response: PageableResult<StockOperationDTO>,
        meta,
        arg
      ) => {
        //response?.results?.sort((a,b)=> a.operationNumber?.localeCompare(b.operationNumber ?? "") ?? 0);
        return response;
      },
    }),
    getStockOperationLinks: build.query<
      PageableResult<StockOperationLinkDTO>,
      string
    >({
      query: (filter) => ({
        url: `${BASE_OPENMRS_APP_URL}ws/rest/v1/stockmanagement/stockoperationlink?v=default&q=${filter}`,
        method: "GET",
      }),
      providesTags: (_result, _err, id) => {
        return [{ type: StockOperationLinksTag }];
      },
    }),
    getStockOperation: build.query<StockOperationDTO, string>({
      query: (id) => ({
        url: `${BASE_OPENMRS_APP_URL}ws/rest/v1/stockmanagement/stockoperation/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _err, id) => {
        return [{ type: StockOperationsTag, id: id }];
      },
    }),

    getStockOperationAndItems: build.query<StockOperationDTO, string>({
      query: (id) => ({
        url: `${BASE_OPENMRS_APP_URL}ws/rest/v1/stockmanagement/stockoperation/${id}?v=full`,
        method: "GET",
      }),
      providesTags: (_result, _err, id) => {
        return [{ type: StockOperationsTag, id: id }];
      },
    }),

    deleteStockOperations: build.mutation<void, string[]>({
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
          url: `${BASE_OPENMRS_APP_URL}ws/rest/v1/stockmanagement/stockoperation/${ids[0]}${otherIds}`,
          method: "DELETE",
        };
      },
      invalidatesTags: (_result, _err, id) => {
        return [{ type: StockOperationsTag }];
      },
    }),
    deleteStockOperationItem: build.mutation<void, string>({
      query: (id) => {
        return {
          url: `${BASE_OPENMRS_APP_URL}ws/rest/v1/stockmanagement/stockoperationitem/${id}`,
          method: "DELETE",
        };
      },
      invalidatesTags: (_result, _err, id) => {
        return [{ type: StockOperationsTag }];
      },
    }),

    createStockOperation: build.mutation<StockOperationDTO, StockOperationDTO>({
      query: (stockOperation) => {
        return {
          url: `${BASE_OPENMRS_APP_URL}ws/rest/v1/stockmanagement/stockoperation`,
          method: "POST",
          body: stockOperation,
        };
      },
      invalidatesTags: (_result, _err, id) => {
        return [{ type: StockOperationsTag }];
      },
    }),
    updateStockOperation: build.mutation<
      StockOperationDTO,
      { model: StockOperationDTO; uuid: string }
    >({
      query: (stockOperation) => {
        return {
          url: `${BASE_OPENMRS_APP_URL}ws/rest/v1/stockmanagement/stockoperation/${stockOperation.uuid}`,
          method: "POST",
          body: stockOperation.model,
        };
      },
      invalidatesTags: (_result, _err, id) => {
        return [{ type: StockOperationsTag, id: id.uuid }];
      },
    }),
    executeStockOperationAction: build.mutation<
      StopOperationAction,
      StopOperationAction
    >({
      query: (stockOperation) => {
        return {
          url: `${BASE_OPENMRS_APP_URL}ws/rest/v1/stockmanagement/stockoperationaction`,
          method: "POST",
          body: stockOperation,
        };
      },
      invalidatesTags: (_result, _err, id) => {
        return [{ type: StockOperationsTag, id: id.uuid }];
      },
    }),
    updateStockOperationBatchNumbers: build.mutation<
      StockOperationDTO,
      { model: any; uuid: string }
    >({
      query: (stockOperation) => {
        return {
          url: `${BASE_OPENMRS_APP_URL}ws/rest/v1/stockmanagement/stockoperationbatchnumbers/${stockOperation.uuid}`,
          method: "POST",
          body: stockOperation.model,
        };
      },
      invalidatesTags: (_result, _err, id) => {
        return [{ type: StockOperationsTag, id: id.uuid }];
      },
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetStockOperationsQuery,
  useDeleteStockOperationsMutation,
  useGetStockOperationQuery,
  useLazyGetStockOperationQuery,
  useCreateStockOperationMutation,
  useUpdateStockOperationMutation,
  useLazyGetStockOperationAndItemsQuery,
  useGetStockOperationAndItemsQuery,
  useDeleteStockOperationItemMutation,
  useExecuteStockOperationActionMutation,
  useGetStockOperationLinksQuery,
  useLazyGetStockOperationLinksQuery,
  useUpdateStockOperationBatchNumbersMutation,
} = stockOperationsApi;
