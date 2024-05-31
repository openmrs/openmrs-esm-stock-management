import { showNotification } from "@openmrs/esm-framework";
import { mutate } from "swr";

export function errorAlert(msg: string, error?: Error) {
  showNotification({
    title: msg,
    kind: "error",
    critical: true,
    description: error?.message,
  });
}

export const handleMutate = (url: string) => {
  mutate((key) => typeof key === "string" && key.startsWith(url), undefined, {
    revalidate: true,
  });
};
