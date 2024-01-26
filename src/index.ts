import { defineConfigSchema, getSyncLifecycle } from "@openmrs/esm-framework";
import { configSchema } from "./config-schema";
import appMenu from "./stock-app-menu-item/item.component";
import bulkImportComponent from "./stock-items/add-bulk-stock-item/stock-items-bulk-import.component";
import deleteUserModalComponent from "./stock-user-role-scopes/delete-stock-user-scope-modal.component";
import deleteStockModalComponent from "./stock-sources/delete-stock-modal.component";
import stockOperationDialogComponent from "./stock-operations/stock-operations-dialog/stock-operations-dialog.component";
import stockManagementDashboardComponent from "./dashboard/stock-management-dashboard.component";
import stockManagementComponent from "./stock-management.component";
import stockManagementAdminCardLinkComponent from "./stock-management-admin-card-link.component";

const moduleName = "@ugandaemr/esm-stock-management-app";

const options = {
  featureName: "stock-management",
  moduleName,
};

export const importTranslation = require.context(
  "../translations",
  false,
  /.json$/,
  "lazy"
);

export const stockManagementAdminCardLink = getSyncLifecycle(
  stockManagementAdminCardLinkComponent,
  options
);

export const stockManagement = getSyncLifecycle(
  stockManagementComponent,
  options
);

export const stockManagementDashboard = getSyncLifecycle(
  stockManagementDashboardComponent,
  options
);

export const stockOperationDialog = getSyncLifecycle(
  stockOperationDialogComponent,
  options
);
export const deleteStockModal = getSyncLifecycle(deleteStockModalComponent, {
  featureName: "delete-stock-modal",
  moduleName,
});

export const deleteUserScopeModal = getSyncLifecycle(deleteUserModalComponent, {
  featureName: "delete-stock-user-scope-modal",
  moduleName,
});

export const importBulkStockItemsDialog = getSyncLifecycle(
  bulkImportComponent,
  options
);

export const stockManagementAppMenuItem = getSyncLifecycle(appMenu, options);

export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
}
