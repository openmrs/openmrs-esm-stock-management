import { openmrsFetch, restBaseUrl } from "@openmrs/esm-framework";

export async function UploadStockItems(body: any) {
  const abortController = new AbortController();

  return openmrsFetch(`${restBaseUrl}/stockmanagement/stockitemimport`, {
    method: "POST",
    // headers: {
    //   "Content-Type": "application/json",
    // },
    signal: abortController.signal,
    body: body,
  });
}
