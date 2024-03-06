export enum ReportParameter {
  Date = "Date",
  StartDate = "StartDate",
  EndDate = "EndDate",
  StockItemCategory = "StockItemCategory",
  Location = "Location",
  ChildLocations = "ChildLocations",
  StockSource = "StockSource",
  StockSourceDestination = "StockSourceDestination",
  InventoryGroupBy = "InventoryGroupBy",
  MaxReorderLevelRatio = "MaxReorderLevelRatio",
  Patient = "Patient",
  StockItem = "StockItem",
  Limit = "Limit",
  MostLeastMoving = "MostLeastMoving",
  Fullfillment = "Fullfillment",
}

export const getParamDefaultLimit = (
  reportSystemName: string | undefined | null
) => {
  return isForecastReport(reportSystemName) ? 4 : reportSystemName ? 20 : null;
};

export const isForecastReport = (
  reportSystemName: string | undefined | null
) => {
  return (
    reportSystemName === "STOCK_FORECAST_REPORT" ||
    reportSystemName === "STOCK_EXPIRY_FORECAST_REPORT"
  );
};

export const getReportLimitLabel = (
  reportSystemName: string | undefined | null
) => {
  return isForecastReport(reportSystemName)
    ? "stockmanagement.report.edit.months"
    : "stockmanagement.report.edit.limit";
};

export const getReportStartDateLabel = (
  reportSystemName: string | undefined | null
) => {
  return isForecastReport(reportSystemName)
    ? "stockmanagement.report.edit.historicalstartdate"
    : "stockmanagement.report.edit.startdate";
};

export const getReportEndDateLabel = (
  reportSystemName: string | undefined | null
) => {
  return isForecastReport(reportSystemName)
    ? "stockmanagement.report.edit.historicalenddate"
    : "stockmanagement.report.edit.enddate";
};

export interface ReportType {
  order: number;
  name: string;
  uuid: string;
  systemName: string;
  parameters: ReportParameter[];
}
