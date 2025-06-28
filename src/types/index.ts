export interface DashboardConfig {
  name: string;
  slot: string;
  title: string;
}

export interface OutofStockListResponse {
  results: Array<{
    partyUuid: string;
    locationUuid: string;
    partyId: number;
    partyName: string;
    outOfStock: number;
  }>;
}
