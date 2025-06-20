import useSWR from 'swr';
import { type FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { type OutofStockListResponse } from '../types';

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

export const useOutOfStockList = () => {
  const url = `${restBaseUrl}/stockmanagement/metrics/outofstockitemstotal`;
  const { data, error, isLoading, mutate } = useSWR<FetchResponse<OutofStockListResponse>>(url, openmrsFetch);

  const totalOutOfStock = data?.data.results?.reduce((total, item) => total + item.outOfStock, 0) ?? 0;

  return {
    outOfStockItemsList: data?.data.results ?? [],
    totalOutOfStock,
    isLoading,
    error,
    mutate,
  };
};
