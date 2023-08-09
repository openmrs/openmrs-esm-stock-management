import {
  defineConfigSchema,
  getAsyncLifecycle,
  provide,
} from "@openmrs/esm-framework";
import { configSchema } from "./config-schema";
import ugandaEmrConfig from "./ugandaemr-config";
import ugandaEmrOverrides from "./ugandaemr-configuration-overrrides.json";

const moduleName = "@ugandaemr/esm-ugandaemr-commodity";

export const importTranslation = require.context(
  "../translations",
  false,
  /.json$/,
  "lazy"
);

const options = {
  featureName: "Uganda Emr commodity",
  moduleName,
};

export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
  provide(ugandaEmrOverrides);
  provide(ugandaEmrConfig);
}

export const root = getAsyncLifecycle(
  () => import("./root.component"),
  options
);
