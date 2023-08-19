import { getAsyncLifecycle, defineConfigSchema } from "@openmrs/esm-framework";
import { configSchema } from "./config-schema";

const moduleName = "@openmrs/esm-template-app";

const options = {
  featureName: "commodity-management",
  moduleName,
};

export const importTranslation = require.context(
  "../translations",
  false,
  /.json$/,
  "lazy"
);

export const stockManagement = getAsyncLifecycle(
  () => import("./stock-management.component"),
  options
);

export const stockManagementLink = getAsyncLifecycle(
  () => import("./stock-management-link.commodity"),
  options
);

export const stockManagementDashboard = getAsyncLifecycle(
  () => import("./dashbooard/stock-management-dashboard.component"),
  options
);

export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
}
