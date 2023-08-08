// Or from '@reduxjs/toolkit/query' if not using the auto-generated hooks
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";
import { createApi, fetchBaseQuery, retry } from "@reduxjs/toolkit/query/react";
import { logout } from "../../stock-auth/authSlice";
import { ALL } from "./tagTypes";
import { PagingCriteria } from "./types/PageableResult";

// Create our baseQuery instance
const baseQuery = fetchBaseQuery({
  baseUrl: "",
  prepareHeaders: (headers, { getState }) => {
    headers.set("Disable-WWW-Authenticate", "true");
    headers.set("Accept", "application/json");
    headers.set("Cache-Control", "no-cache");
    headers.set("Pragma", "no-cache");
    headers.set("Expires", "0");

    // By default, if we have a token in the store, let's use that for authenticated requests
    /*const token = (getState() as RootState).auth.token
    if (token) {
      headers.set('authentication', `Bearer ${token}`)
    }
    return headers*/
    return headers;
  },
});

const baseQueryWithRetry = retry(baseQuery, { maxRetries: 0 });

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQueryWithRetry(args, api, extraOptions);
  if (result.error || (result as any).data?.error) {
    if (
      (result as any)?.error?.originalStatus === 401 ||
      (result as any).status === 401 ||
      result.error?.status === 401 /* Unauthorized  */
    ) {
      api.dispatch(logout());
      retry.fail(result.error);
    } else if (
      (result as any)?.error?.originalStatus === 403 ||
      (result as any).status === 403 ||
      result.error?.status === 403 /* OpenMRS returns 403 */
    ) {
      if ((result as any)?.error?.data) {
        let dataString = ((result as any)?.error?.data as any).toString();
        if (
          dataString.indexOf("<!doctype") >= 0 &&
          dataString.indexOf("HTTP Status 403 – Forbidden") >= 0
        ) {
          api.dispatch(logout());
          retry.fail(result.error);
        }
      }
    }
  }

  return result;
};

/**
 * Create a base API to inject endpoints into elsewhere.
 * Components using this API should import from the injected site,
 * in order to get the appropriate types,
 * and to ensure that the file injecting the endpoints is loaded
 */
export const api = createApi({
  /**
   * A bare bones base query would just be `baseQuery: fetchBaseQuery({ baseUrl: '/' })`
   */
  baseQuery: baseQueryWithReauth,

  /**
   * Tag types must be defined in the original API definition
   * for any tags that would be provided by injected endpoints
   */
  tagTypes: ALL,
  /**
   * This api has endpoints injected in adjacent files,
   * which is why no endpoints are shown below.
   * If you want all endpoints defined in the same file, they could be included here instead
   */
  endpoints: () => ({}),

  keepUnusedDataFor: 5,
});

export enum ResourceRepresentation {
  Default = "default",
  Full = "full",
  REF = "ref",
}

export interface ResourceFilterCriteria extends PagingCriteria {
  v?: ResourceRepresentation | null;
  q?: string | null;
  totalCount?: boolean | null;
}

export function toQueryParams<T extends ResourceFilterCriteria>(
  filterCriteria?: T | null,
  skipEmptyString = true
): string {
  if (!filterCriteria) return "";
  let queryParams: string = Object.keys(filterCriteria)
    ?.map((key) => {
      let value: Object = (filterCriteria as any)[key];
      return (skipEmptyString &&
        (value === false || value === true ? true : value)) ||
        (!skipEmptyString &&
          (value === "" || (value === false || value === true ? true : value)))
        ? `${encodeURIComponent(key)}=${encodeURIComponent(value.toString())}`
        : null;
    })
    .filter((o) => o != null)
    .join("&");
  return queryParams.length > 0 ? "?" + queryParams : "";
}
