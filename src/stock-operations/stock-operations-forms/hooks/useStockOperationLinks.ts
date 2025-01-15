import { FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';

const useStockOperationLinks = (stockOperationUuid?: string) => {
  const apiUrl = `${restBaseUrl}/stockmanagement/stockoperationlink?v=default&q=${stockOperationUuid}`;
  const { data, error, isLoading, mutate } = useSWR<
    FetchResponse<{
      results: Array<{
        parentUuid: string;
        childOperationTypeName: string;
        childVoided: boolean;
        childOperationNumber: string;
        parentOperationNumber: string;
        childUuid: string;
        childStatus: string;
        parentStatus: string;
        parentVoided: boolean;
        parentOperationTypeName: string;
      }>;
    }>
  >(stockOperationUuid ? apiUrl : null, openmrsFetch);
  return {
    error,
    isLoading,
    mutate,
    operationLinks: data?.data?.results ?? [],
  };
};

export default useStockOperationLinks;
