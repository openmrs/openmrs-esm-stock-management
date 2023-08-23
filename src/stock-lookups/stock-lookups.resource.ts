import { openmrsFetch } from "@openmrs/esm-framework";
import { ResourceFilterCriteria, toQueryParams } from "../core/api/api";
import { PageableResult } from "../core/api/types/PageableResult";
import {
  OpenMRSLocation,
  OpenMRSLocationTag,
} from "../core/api/types/Location";
import useSWR from "swr";
import { Role } from "../core/api/types/identity/Role";
import { User } from "../core/api/types/identity/User";
import { StockOperationType } from "../core/api/types/stockOperation/StockOperationType";
import { Concept } from "../core/api/types/concept/Concept";
import { Party } from "../core/api/types/Party";
import { Drug } from "../core/api/types/concept/Drug";
import { Patient } from "../core/api/types/identity/Patient";

export type PatientFilterCriteria = ResourceFilterCriteria;

export type UserFilterCriteria = ResourceFilterCriteria;

export type DrugFilterCriteria = ResourceFilterCriteria;

export type ConceptFilterCriteria = ResourceFilterCriteria;

export type LocationFilterCriteria = ResourceFilterCriteria;

// getLocations
export function useStockLocations(filter: LocationFilterCriteria) {
  const apiUrl = `ws/rest/v1/location${toQueryParams(filter, false)}`;
  const { data, error, isLoading } = useSWR<
    {
      data: PageableResult<OpenMRSLocation>;
    },
    Error
  >(apiUrl, openmrsFetch);
  return {
    locations: data?.data || <PageableResult<OpenMRSLocation>>{},
    isErrorLocation: error,
    isLoadingLocations: isLoading,
  };
}

// getLocationWithIdByUuid
export function useLocationWithIdByUuid(id: string) {
  const apiUrl = `ws/rest/v1/stockmanagement/location/${id}`;
  const { data, error, isLoading } = useSWR<
    {
      data: PageableResult<OpenMRSLocation>;
    },
    Error
  >(apiUrl, openmrsFetch);
  return {
    items: data.data ? data.data : [],
    isLoading,
    isError: error,
  };
}

//  deleteLocation
export function deleteLocation(id: string) {
  const apiUrl = `ws/rest/v1/stockmanagement/location/${id}`;
  const abortController = new AbortController();
  return openmrsFetch(apiUrl, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    signal: abortController.signal,
  });
}

// getLocationTags
export function useLocationTags(q: string) {
  const apiUrl = `ws/rest/v1/locationtag?v=default${
    q && q.length > 0 ? "&q=" + encodeURIComponent(q) : ""
  }`;
  const { data, error, isLoading } = useSWR<
    {
      data: PageableResult<OpenMRSLocationTag>;
    },
    Error
  >(apiUrl, openmrsFetch);
  return {
    items: data.data ? data.data : [],
    isLoading,
    isError: error,
  };
}

// getRoles
export function useRoles(filter: ResourceFilterCriteria) {
  const apiUrl = `ws/rest/v1/role${toQueryParams(filter)}`;
  const { data, error, isLoading } = useSWR<
    {
      data: PageableResult<Role>;
    },
    Error
  >(apiUrl, openmrsFetch);
  return {
    items: data.data ? data.data : [],
    isLoading,
    isError: error,
  };
}

// getStockOperationTypes
export function useStockOperationTypes() {
  const apiUrl = `ws/rest/v1/stockmanagement/stockoperationtype?v=default`;
  const { data, isLoading, error } = useSWR<
    {
      data: PageableResult<StockOperationType>;
    },
    Error
  >(apiUrl, openmrsFetch);
  return {
    types: data?.data || <PageableResult<StockOperationType>>{},
    isLoading,
    isError: error,
  };
}

// getUsers
export function useUsers(filter: UserFilterCriteria) {
  const apiUrl = `ws/rest/v1/user${toQueryParams(filter)}`;
  const { data, error, isLoading } = useSWR<
    {
      data: PageableResult<User>;
    },
    Error
  >(apiUrl, openmrsFetch);
  return {
    items: data.data ? data.data : [],
    isLoading,
    isError: error,
  };
}

// getUser
export function useUser(id: string) {
  const apiUrl = `ws/rest/v1/user${id}`;
  const { data, error, isLoading } = useSWR<
    {
      data: User;
    },
    Error
  >(apiUrl, openmrsFetch);
  return {
    items: data.data ? data.data : {},
    isLoading,
    isError: error,
  };
}

// getConceptById
export function useConceptById(id: string) {
  const apiUrl = `ws/rest/v1/concept/${id}`;
  const { data, error, isLoading } = useSWR<
    {
      data: Concept;
    },
    Error
  >(apiUrl, openmrsFetch);
  return {
    items: data?.data || <Concept>{},
    isLoading,
    isError: error,
  };
}

// getParties
export function useParties() {
  const apiUrl = `ws/rest/v1/stockmanagement/party?v=default`;
  const { data, error, isLoading } = useSWR<
    {
      data: PageableResult<Party>;
    },
    Error
  >(apiUrl, openmrsFetch);
  return {
    items: data.data ? data.data : [],
    isLoading,
    isError: error,
  };
}

// getDrugs
export function useDrugs(filter: DrugFilterCriteria) {
  const apiUrl = `ws/rest/v1/drug${toQueryParams(filter)}`;
  const { data, error, isLoading } = useSWR<
    {
      data: PageableResult<Drug>;
    },
    Error
  >(apiUrl, openmrsFetch);
  return {
    items: data?.data || <PageableResult<Drug>>{},
    isLoading,
    isError: error,
  };
}

// getConcepts
export function useConcepts(filter: ConceptFilterCriteria) {
  const apiUrl = `ws/rest/v1/concept${toQueryParams(filter)}`;
  const { data, error, isLoading } = useSWR<
    {
      data: PageableResult<Concept>;
    },
    Error
  >(apiUrl, openmrsFetch);
  return {
    items: data.data ? data.data : [],
    isLoading,
    isError: error,
  };
}

// getPatients
export function usePatients(filter: ConceptFilterCriteria) {
  const apiUrl = `ws/rest/v1/patient${toQueryParams(filter)}`;
  const { data, error, isLoading } = useSWR<
    {
      data: PageableResult<Patient>;
    },
    Error
  >(apiUrl, openmrsFetch);
  return {
    items: data.data ? data.data : [],
    isLoading,
    isError: error,
  };
}
