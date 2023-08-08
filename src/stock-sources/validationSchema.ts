import * as Yup from "yup";

export const editValidationSchema = Yup.object({
  name: Yup.string()
    .required("stockmanagement.stocksource.validation.namerequired")
    .max(255),
  acronym: Yup.string()
    .required("stockmanagement.stocksource.validation.acronymrequired")
    .max(255),
  sourceType: Yup.string().required(
    "stockmanagement.stocksource.validation.sourcetyperequired"
  ),
});
