import useSWR from 'swr';
import { openmrsFetch } from '@openmrs/esm-framework';


interface DisposalList {
  uuid: string;
  operationType: string;
  status: string;
  results: {
    uuid: string;
    operationType: string;
    status: string;

  }

}

const useDisposalList = () => {
  const url = `/ws/rest/v1/stockmanagement/stockoperation`;

  const { data, error } = useSWR<{ data: { results: Array<DisposalList> } }>(url, openmrsFetch);


  const disposalstocks = data?.data.results.map((disposalstock) => ({
    uuid: disposalstock.uuid,
    hasExpiration: disposalstock.operationType,
    ExpiryNotice: disposalstock.status,
  }));


  
  return { disposalList: (disposalstocks as Array<any>) ?? [], isLoading: !data && !error, error };
};


export default useDisposalList;