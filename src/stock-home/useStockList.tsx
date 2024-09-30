import useSWR from 'swr';
import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';

interface StockList {
  uuid: string;
  hasExpiration: boolean;
  expiryNotice: number;
  results: {
    uuid: string;
    hasExpiration: boolean;
    expiryNotice: number;
  };
}

const useStockList = () => {
  const url = `${restBaseUrl}/stockmanagement/stockitem?v=default&totalCount=true`;

  const { data, error, isLoading } = useSWR<{ data: { results: Array<StockList> } }>(url, openmrsFetch);

  const stocks = data?.data.results.map((stock) => ({
    uuid: stock.uuid,
    hasExpiration: stock.hasExpiration,
    expiryNotice: stock.expiryNotice,
  }));

  return {
    stockList: (stocks as Array<any>) ?? [],
    isLoading,
    error,
  };
};

export default useStockList;
