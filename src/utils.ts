import { showNotification } from "@openmrs/esm-framework";

export function errorAlert(msg: string, error?: Error) {
  showNotification({
    title: msg,
    kind: "error",
    critical: true,
    description: error?.message,
  });
}
