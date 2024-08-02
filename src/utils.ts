import { showSnackbar } from "@openmrs/esm-framework";
import { mutate } from "swr";

export function errorAlert(msg: string, error?: Error) {
  showSnackbar({
    title: msg,
    kind: "error",
    isLowContrast: true,
    subtitle: error?.message,
  });
}

export const handleMutate = (url: string) => {
  mutate((key) => typeof key === "string" && key.startsWith(url), undefined, {
    revalidate: true,
  });
};
