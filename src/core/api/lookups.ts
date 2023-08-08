import { BASE_OPENMRS_APP_URL } from "../../constants";
import { api, ResourceFilterCriteria, toQueryParams } from "./api";
import {
  ConceptsTag,
  DrugsTag,
  LIST_ID,
  LocationsTag,
  LocationTagsTag,
  LocationWithIdTag,
  PartyTag,
  PatientsTag,
  RolesTag,
  StockOperationTypesTag,
  StockSourcesTag,
  UsersTag,
} from "./tagTypes";
import { Concept } from "./types/concept/Concept";
import { Drug } from "./types/concept/Drug";
import { Patient } from "./types/identity/Patient";
import { Role } from "./types/identity/Role";
import { User } from "./types/identity/User";
import { OpenMRSLocation, OpenMRSLocationTag } from "./types/Location";
import { PageableResult } from "./types/PageableResult";
import { Party } from "./types/Party";
import { StockOperationType } from "./types/stockOperation/StockOperationType";

export interface PatientFilterCriteria extends ResourceFilterCriteria {}

export interface UserFilterCriteria extends ResourceFilterCriteria {}

export interface DrugFilterCriteria extends ResourceFilterCriteria {}

export interface ConceptFilterCriteria extends ResourceFilterCriteria {}

export interface LocationFilterCriteria extends ResourceFilterCriteria {}

export const lookupsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getLocations: build.query<
      PageableResult<OpenMRSLocation>,
      LocationFilterCriteria | null
    >({
      query: (filter) => ({
        url: `${BASE_OPENMRS_APP_URL}ws/rest/v1/location${toQueryParams(
          filter,
          false
        )}`,
        method: "GET",
      }),
      providesTags: (_result, _err, id) => {
        return [{ type: LocationsTag, id: LIST_ID }];
      },
    }),
    getLocationWithIdByUuid: build.query<OpenMRSLocation, string>({
      query: (id) => ({
        url: `${BASE_OPENMRS_APP_URL}ws/rest/v1/stockmanagement/location/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _err, id) => {
        return [{ type: LocationWithIdTag, id: id }];
      },
    }),
    deleteLocation: build.mutation<void, string>({
      query: (id) => {
        return {
          url: `${BASE_OPENMRS_APP_URL}ws/rest/v1/stockmanagement/location/${id}`,
          method: "DELETE",
        };
      },
      invalidatesTags: (_result, _err, id) => {
        return [{ type: LocationsTag }];
      },
    }),
    getLocationTags: build.query<
      PageableResult<OpenMRSLocationTag>,
      string | null
    >({
      query: (q) => ({
        url: `${BASE_OPENMRS_APP_URL}ws/rest/v1/locationtag?v=default${
          q && q.length > 0 ? "&q=" + encodeURIComponent(q) : ""
        }`,
        method: "GET",
      }),
      providesTags: (_result, _err, id) => {
        return [{ type: LocationTagsTag, id: LIST_ID }];
      },
    }),
    getRoles: build.query<PageableResult<Role>, ResourceFilterCriteria>({
      query: (filter) => ({
        url: `${BASE_OPENMRS_APP_URL}ws/rest/v1/role${toQueryParams(filter)}`,
        method: "GET",
      }),
      providesTags: (_result, _err, id) => {
        return [{ type: RolesTag, id: LIST_ID }];
      },
    }),
    getStockOperationTypes: build.query<
      PageableResult<StockOperationType>,
      void
    >({
      query: () => ({
        url: `${BASE_OPENMRS_APP_URL}ws/rest/v1/stockmanagement/stockoperationtype?v=default`,
        method: "GET",
      }),
      providesTags: (_result, _err, id) => {
        return [{ type: StockOperationTypesTag, id: LIST_ID }];
      },
    }),
    getUsers: build.query<PageableResult<User>, UserFilterCriteria>({
      query: (filter) => ({
        url: `${BASE_OPENMRS_APP_URL}ws/rest/v1/user${toQueryParams(filter)}`,
        method: "GET",
      }),
      providesTags: (_result, _err, id) => {
        return [{ type: UsersTag, id: LIST_ID }];
      },
    }),
    getUser: build.query<User, string>({
      query: (id) => ({
        url: `${BASE_OPENMRS_APP_URL}ws/rest/v1/user/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _err, id) => {
        return [{ type: UsersTag, id }];
      },
    }),
    getConceptById: build.query<Concept, string>({
      query: (id) => ({
        url: `${BASE_OPENMRS_APP_URL}ws/rest/v1/concept/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _err, id) => {
        return [{ type: ConceptsTag, id: id }];
      },
    }),
    getParties: build.query<PageableResult<Party>, void>({
      query: (q) => ({
        url: `${BASE_OPENMRS_APP_URL}ws/rest/v1/stockmanagement/party?v=default`,
        method: "GET",
      }),
      providesTags: (_result, _err, id) => {
        return [{ type: PartyTag, id: LIST_ID }, { type: StockSourcesTag }];
      },
    }),
    getDrugs: build.query<PageableResult<Drug>, DrugFilterCriteria>({
      query: (filter) => ({
        url: `${BASE_OPENMRS_APP_URL}ws/rest/v1/drug${toQueryParams(filter)}`,
        method: "GET",
      }),
      providesTags: (_result, _err, id) => {
        return [{ type: DrugsTag, id: LIST_ID }];
      },
    }),
    getConcepts: build.query<PageableResult<Concept>, ConceptFilterCriteria>({
      query: (filter) => ({
        url: `${BASE_OPENMRS_APP_URL}ws/rest/v1/concept${toQueryParams(
          filter
        )}`,
        method: "GET",
      }),
      providesTags: (_result, _err, id) => {
        return [{ type: ConceptsTag, id: LIST_ID }];
      },
    }),
    getPatients: build.query<PageableResult<Patient>, PatientFilterCriteria>({
      query: (filter) => ({
        url: `${BASE_OPENMRS_APP_URL}ws/rest/v1/patient${toQueryParams(
          filter
        )}`,
        method: "GET",
      }),
      providesTags: (_result, _err, id) => {
        return [{ type: PatientsTag, id: LIST_ID }];
      },
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetLocationsQuery,
  useGetLocationTagsQuery,
  useGetRolesQuery,
  useLazyGetRolesQuery,
  useGetStockOperationTypesQuery,
  useGetUserQuery,
  useGetUsersQuery,
  useLazyGetUserQuery,
  useLazyGetUsersQuery,
  useLazyGetConceptByIdQuery,
  useGetConceptByIdQuery,
  useLazyGetLocationsQuery,
  useLazyGetStockOperationTypesQuery,
  useGetPartiesQuery,
  useLazyGetPartiesQuery,
  useGetConceptsQuery,
  useLazyGetConceptsQuery,
  useGetDrugsQuery,
  useLazyGetDrugsQuery,
  useDeleteLocationMutation,
  useGetLocationWithIdByUuidQuery,
  useLazyGetLocationWithIdByUuidQuery,
  useLazyGetPatientsQuery,
} = lookupsApi;
