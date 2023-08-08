import { BASE_OPENMRS_APP_URL } from "../../constants";
import { api, ResourceFilterCriteria, toQueryParams } from "./api";
import { LIST_ID, UserRoleScopesTag } from "./tagTypes";
import { UserRoleScope } from "./types/identity/UserRoleScope";
import { PageableResult } from "./types/PageableResult";

export interface UserRoleScopeFilter extends ResourceFilterCriteria {}

const userRoleScopesApi = api.injectEndpoints({
  endpoints: (build) => ({
    getUserRoleScopes: build.query<
      PageableResult<UserRoleScope>,
      UserRoleScopeFilter
    >({
      query: (filter) => ({
        url: `${BASE_OPENMRS_APP_URL}ws/rest/v1/stockmanagement/userrolescope${toQueryParams(
          filter
        )}`,
        method: "GET",
      }),
      providesTags: (_result, _err, id) => {
        return [{ type: UserRoleScopesTag, id: LIST_ID }];
      },
    }),

    getUserRoleScope: build.query<UserRoleScope, string>({
      query: (id) => ({
        url: `${BASE_OPENMRS_APP_URL}ws/rest/v1/stockmanagement/userrolescope/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _err, id) => {
        return [{ type: UserRoleScopesTag, id }];
      },
    }),
    deleteUserRoleScopes: build.mutation<void, string[]>({
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
          url: `${BASE_OPENMRS_APP_URL}ws/rest/v1/stockmanagement/userrolescope/${ids[0]}${otherIds}`,
          method: "DELETE",
        };
      },
      invalidatesTags: (_result, _err, id) => {
        return [{ type: UserRoleScopesTag }];
      },
    }),
    createOrUpdateUserRoleScope: build.mutation<void, UserRoleScope>({
      query: (userRoleScope) => {
        var isNew = userRoleScope.uuid != null;
        return {
          url: `${BASE_OPENMRS_APP_URL}ws/rest/v1/stockmanagement/userrolescope${
            isNew ? "/" + userRoleScope.uuid : ""
          }`,
          method: "POST",
          body: userRoleScope,
        };
      },
      invalidatesTags: (_result, _err, id) => {
        return [{ type: UserRoleScopesTag }];
      },
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetUserRoleScopesQuery,
  useDeleteUserRoleScopesMutation,
  useGetUserRoleScopeQuery,
  useLazyGetUserRoleScopeQuery,
  useCreateOrUpdateUserRoleScopeMutation,
} = userRoleScopesApi;
