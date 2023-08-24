import dayjs from "dayjs";
import { formatDisplayDate } from "./core/utils/datetimeUtils";

export const moduleName = "@ugandaemr/esm-stock-management-app";

export const spaRoot = window["getOpenmrsSpaBase"];
export const spaBasePath = `${window.spaBase}/commodity`;
export const omrsDateFormat = "YYYY-MM-DDTHH:mm:ss.SSSZZ";
export const startOfDay = dayjs(new Date().setUTCHours(0, 0, 0, 0)).format(
  omrsDateFormat
);
export const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

export const DATE_PICKER_FORMAT = "DD/MM/YYYY";

export const DATE_PICKER_CONTROL_FORMAT = "d/m/Y";

export const formatForDatePicker = (date: Date | null | undefined) => {
  return formatDisplayDate(date, DATE_PICKER_FORMAT);
};

export const today = () => {
  const date = new Date();
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

// privileges
/** @type {string}: App: stockmanagement.dashboard, Able to view stock management application dashboard*/
export const APP_STOCKMANAGEMENT_DASHBOARD = "App: stockmanagement.dashboard";

/** @type {string}: App: stockmanagement.stockItems, Able to view stock items*/
export const APP_STOCKMANAGEMENT_STOCKITEMS = "App: stockmanagement.stockItems";

/** @type {string}: Task: stockmanagement.stockItems.mutate, Able to create and update  stock items*/
export const TASK_STOCKMANAGEMENT_STOCKITEMS_MUTATE =
  "Task: stockmanagement.stockItems.mutate";

/** @type {string}: Task: stockmanagement.stockItems.dispense.qty, Able to view stock item quantities at dispensing locations*/
export const TASK_STOCKMANAGEMENT_STOCKITEMS_DISPENSE_QTY =
  "Task: stockmanagement.stockItems.dispense.qty";

/** @type {string}: Task: stockmanagement.stockItems.dispense, Able to dispense stock items*/
export const TASK_STOCKMANAGEMENT_STOCKITEMS_DISPENSE =
  "Task: stockmanagement.stockItems.dispense";

/** @type {string}: App: stockmanagement.userRoleScopes, Able to view stock management user role scope*/
export const APP_STOCKMANAGEMENT_USERROLESCOPES =
  "App: stockmanagement.userRoleScopes";

/** @type {string}: Task: stockmanagement.userRoleScopes.mutate, Able to create and update user role scopes*/
export const TASK_STOCKMANAGEMENT_USERROLESCOPES_MUTATE =
  "Task: stockmanagement.userRoleScopes.mutate";

/** @type {string}: App: stockmanagement.stockoperations, Able to view stock operations*/
export const APP_STOCKMANAGEMENT_STOCKOPERATIONS =
  "App: stockmanagement.stockoperations";

/** @type {string}: Task: stockmanagement.stockoperations.mutate, Able to create and update stock operations*/
export const TASK_STOCKMANAGEMENT_STOCKOPERATIONS_MUTATE =
  "Task: stockmanagement.stockoperations.mutate";

/** @type {string}: Task: stockmanagement.stockoperations.approve, Able to aprove stock operations*/
export const TASK_STOCKMANAGEMENT_STOCKOPERATIONS_APPROVE =
  "Task: stockmanagement.stockoperations.approve";

/** @type {string}: Task: stockmanagement.stockoperations.receiveitems, Able to receive dispatched stock items*/
export const TASK_STOCKMANAGEMENT_STOCKOPERATIONS_RECEIVEITEMS =
  "Task: stockmanagement.stockoperations.receiveitems";

/** @type {string}: App: stockmanagement.stockSources, Able to view stock sources*/
export const APP_STOCKMANAGEMENT_STOCKSOURCES =
  "App: stockmanagement.stockSources";

/** @type {string}: Task: stockmanagement.stockSources.mutate, Able to create and update stock sources*/
export const TASK_STOCKMANAGEMENT_STOCKSOURCES_MUTATE =
  "Task: stockmanagement.stockSources.mutate";

/** @type {string}: App: stockmanagement.stockOperationType, Able to view stock operation types*/
export const APP_STOCKMANAGEMENT_STOCKOPERATIONTYPE =
  "App: stockmanagement.stockOperationType";

/** @type {string}: Task: stockmanagement.party.read, Able to read party information*/
export const TASK_STOCKMANAGEMENT_PARTY_READ =
  "Task: stockmanagement.party.read";

/** @type {string}: App: stockmanagement.reports, Able to view stock reports*/
export const APP_STOCKMANAGEMENT_REPORTS = "App: stockmanagement.reports";

/** @type {string}: Task: stockmanagement.reports.mutate, Able to create stock reports*/

// concepts
export const STOCK_SOURCE_TYPE_CODED_CONCEPT_ID =
  "2e1e8049-9cbe-4a2d-b1e5-8a91e5d7d97d";
export const STOCK_ADJUSTMENT_REASON_CODED_CONCEPT_ID =
  "3bbfaa44-d5b8-404d-b4c1-2bf49ad8ce25";
export const DISPENSING_UNITS_CONCEPT_ID =
  "162402AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
export const PACKAGING_UNITS_CODED_CONCEPT_ID =
  "bce2b1af-98b1-48a2-98a2-3e4ffb3c79c2";
export const STOCK_ITEM_CATEGORY_CONCEPT_ID =
  "6d24eb6e-b42f-4706-ab2d-ae4472161f6a";

export const STOCK_OPERATION_PRINT_DISABLE_BALANCE_ON_HAND = false;
export const STOCK_OPERATION_PRINT_DISABLE_COSTS = false;
export const HEALTH_CENTER_NAME = "Health Center";
export const PRINT_LOGO =
  "moduleResources/stockmanagement/assets/print-logo.svg";
export const PRINT_LOGO_TEXT = "Ministry of Health";
