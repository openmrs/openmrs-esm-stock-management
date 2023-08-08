import { defineConfigSchema, provide } from "@openmrs/esm-framework";
import { configSchema } from "./config-schema";
import ugandaEmrConfig from "./ugandaemr-config";
import ugandaEmrOverrides from "./ugandaemr-configuration-overrrides.json";

declare var __VERSION__: string;
// __VERSION__ is replaced by Webpack with the version from package.json
const version = __VERSION__;

const moduleName = "@openmrs/esm-template-app";

const importTranslation = require.context(
  "../translations",
  false,
  /.json$/,
  "lazy"
);

const options = {
  featureName: "Uganda Emr commodity",
  moduleName,
};

const backendDependencies = {
  fhir2: "^1.2.0",
  "webservices.rest": "^2.2.0",
};

function setupOpenMRS() {
  defineConfigSchema(moduleName, configSchema);
  provide(ugandaEmrOverrides);
  provide(ugandaEmrConfig);
  return {
    pages: [],
    extensions: [{}],
  };
}

export { backendDependencies, importTranslation, setupOpenMRS, version };
