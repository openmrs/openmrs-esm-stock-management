import { retry } from "@reduxjs/toolkit/query/react";
import { BASE_OPENMRS_APP_URL } from "../../constants";
import {
  GetSessionResponse,
  StockManagementSession,
} from "../api/types/identity/Session";
import { api } from "./api";
import { SessionTag } from "./tagTypes";
import { DashboardExtension } from "./types/DashboardExtension";
import { PageableResult } from "./types/PageableResult";
import { Credentials } from "./types/identity/Credentials";

export const sessionApi = api.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<GetSessionResponse, any>({
      query: (credentials: Credentials) => ({
        url: BASE_OPENMRS_APP_URL + "ws/rest/v1/session",
        method: "GET",
        headers: {
          Authorization: `Basic ${btoa(
            credentials?.username + ":" + credentials?.password
          )}`,
        },
      }),
      invalidatesTags: (_result, _err, id) => {
        return [{ type: SessionTag }];
      },
      extraOptions: {
        backoff: () => {
          // We intentionally error once on login, and this breaks out of retrying. The next login attempt will succeed.
          retry.fail({ fake: "error" });
        },
      },
    }),
    logout: build.mutation<void, any>({
      query: () => ({
        url: BASE_OPENMRS_APP_URL + "ws/rest/v1/session",
        method: "DELETE",
      }),
      invalidatesTags: (_result, _err, id) => {
        return [{ type: SessionTag }];
      },
      extraOptions: {
        backoff: () => {
          // We intentionally error once on login, and this breaks out of retrying. The next login attempt will succeed.
          retry.fail({ fake: "error" });
        },
      },
    }),
    getSession: build.query<GetSessionResponse, void>({
      query: () => ({
        url: BASE_OPENMRS_APP_URL + "ws/rest/v1/session",
        method: "GET",
      }),
      providesTags: (_result, _err) => {
        return [{ type: SessionTag }];
      },
      extraOptions: {
        backoff: () => {
          // We intentionally error once on login, and this breaks out of retrying. The next login attempt will succeed.
          retry.fail({ fake: "error" });
        },
      },
    }),
    getStockManagementSession: build.query<
      StockManagementSession,
      string | null
    >({
      query: (id) => ({
        url: BASE_OPENMRS_APP_URL + "ws/rest/v1/stockmanagement/session",
        method: "GET",
      }),
      providesTags: (_result, _err) => {
        return [{ type: SessionTag }];
      },
      extraOptions: {
        backoff: () => {
          // We intentionally error once on login, and this breaks out of retrying. The next login attempt will succeed.
          retry.fail({ fake: "error" });
        },
      },
    }),
    getDashboardExtensions: build.query<
      PageableResult<DashboardExtension>,
      void
    >({
      query: () => ({
        url:
          BASE_OPENMRS_APP_URL +
          "ws/rest/v1/stockmanagement/dashboardextension",
        method: "GET",
      }),
      providesTags: (_result, _err) => {
        return [{ type: SessionTag }];
      },
    }),
  }),
  overrideExisting: false,
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useGetSessionQuery,
  useGetDashboardExtensionsQuery,
  useGetStockManagementSessionQuery,
  useLazyGetStockManagementSessionQuery,
} = sessionApi;
export const {
  endpoints: { login, logout },
} = sessionApi;
