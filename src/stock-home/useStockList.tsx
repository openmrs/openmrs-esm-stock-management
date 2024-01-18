import useSWR from 'swr';
import { openmrsFetch } from '@openmrs/esm-framework';


interface StockList {
  uuid: string;
  hasExpiration: boolean;
  ExpiryNotice: number;
  results: {
    uuid: string;
    hasExpiration: boolean;
    ExpiryNotice: number;

  }

}

const useStockList = () => {
  const url = `/ws/rest/v1/stockmanagement/stockitem`;

  const { data, error } = useSWR<{ data: { results: Array<StockList> } }>(url, openmrsFetch);


  const stocks = data?.data.results.map((stock) => ({
    uuid: stock.uuid,
    hasExpiration: stock.hasExpiration,
    ExpiryNotice: stock.ExpiryNotice,
  }));


  
  return { stockList: (stocks as Array<any>) ?? [], isLoading: !data && !error, error };
};


export default useStockList;