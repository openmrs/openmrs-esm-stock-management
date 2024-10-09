import { PageableResult } from '../core/api/types/PageableResult';
import { StockOperationType } from '../core/api/types/stockOperation/StockOperationType';

export interface DashboardConfig {
  name: string;
  slot: string;
  title: string;
}

export type StockOperationTypeResponse = {
  data: PageableResult<StockOperationType>;
};

export type SystemSettingResponse = {
  results: Array<{
    uuid: string;
    display: string;
    value: string;
    property: string;
  }>;
};
