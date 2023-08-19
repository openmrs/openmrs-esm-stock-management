import {
  getAsyncLifecycle,
  defineConfigSchema,
  getSyncLifecycle,
} from "@openmrs/esm-framework";
import { configSchema } from "./config-schema";
import { createDashboardLink } from "./createDashboardLink";
import { dashboardMeta } from "./dashboard.meta";

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

export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
}

export const root = getAsyncLifecycle(
  () => import("./root.component"),
  options
);

export const stockItemExt = getAsyncLifecycle(
  () => import("./stock-items/stock-items.component"),
  {
    featureName: "stock-items",
    moduleName,
  }
);

export const stockManagementLink = getAsyncLifecycle(
  () => import("./stock-management-link.commodity"),
  {
    featureName: "stock-management-link",
    moduleName,
  }
);
