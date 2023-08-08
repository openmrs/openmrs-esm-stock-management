export function htmlSafeId(id: string) {
  return `${id.replaceAll(".", "-")}-${id.replaceAll(".", "-")}-extension`;
}

export function toErrorMessage(payload: any) {
  if (!payload) return payload;
  let errorMessage =
    payload?.error?.data?.error?.message ??
    payload?.data?.error?.message ??
    payload?.message ??
    payload?.error ??
    payload;
  let fieldErrors =
    payload?.error?.fieldErrors ?? payload?.data?.error?.fieldErrors;

  console.log(payload);
  if (fieldErrors) {
    let field: keyof typeof fieldErrors;
    let errors: any[] = [];
    for (field in fieldErrors) {
      errors.push(
        fieldErrors[field]?.reduce((p: any, c: any, i: number) => {
          if (i === 0) return c?.message ?? "";
          p += (p.length > 0 ? " \r\n" : "") + c?.message;
          return p;
        }, "")
      );
    }
    return `${errorMessage} ${errors.join(" \r\n")}`;
  }
  return errorMessage;
}

export function isNullOrEmptryOrWhiteSpace(payload: string | null | undefined) {
  return !payload || payload.length === 0 || !payload.trim();
}

export function getStockOperationUniqueId() {
  return `${new Date().getTime()}-${Math.random()
    .toString(36)
    .substring(2, 16)}`;
}
