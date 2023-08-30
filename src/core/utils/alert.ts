import { showToast } from "@openmrs/esm-framework";

export function errorAlert(title: string, msg: string) {
  showToast({
    critical: true,
    title: title,
    kind: "error",
    description: msg,
  });
}
