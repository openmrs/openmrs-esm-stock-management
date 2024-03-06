import { openmrsFetch, restBaseUrl } from "@openmrs/esm-framework";
import useSWR from "swr";
import { ReportType } from "./ReportType";

export function useReportTypes() {
  const apiUrl = `${restBaseUrl}/stockmanagement/report?v=default`;
  const { data, error, isLoading } = useSWR<
    { data: { results: ReportType } },
    Error
  >(apiUrl, openmrsFetch);
  return {
    reportTypes: data?.data?.results ?? [],
    isLoading,
    isError: error,
  };
}
