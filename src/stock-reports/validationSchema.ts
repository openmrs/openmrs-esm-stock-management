import * as Yup from "yup";
import { ReportParameter } from "./stock-report-type";

export const editValidationSchema = Yup.object({
  reportSystemName: Yup.string().required("stockmanagement.field.required"),
  parameters: Yup.array(Yup.string()).nullable(),
  date: Yup.date()
    .test(
      "is-date-required",
      "stockmanagement.field.required",
      function (fieldVaue) {
        const { parameters } = this.parent;
        if (parameters) {
          let hasParameter = (parameters as string[]).some(
            (p) => p === ReportParameter.Date
          );
          return hasParameter === false || !!fieldVaue;
        }
        return true;
      }
    )
    .nullable(),

  startDate: Yup.date()
    .test(
      "is-startDate-required",
      "stockmanagement.field.required",
      function (fieldVaue) {
        const { parameters } = this.parent;
        if (parameters) {
          let hasParameter = (parameters as string[]).some(
            (p) => p === ReportParameter.StartDate
          );
          return hasParameter === false || !!fieldVaue;
        }
        return true;
      }
    )
    .nullable(),

  endDate: Yup.date()
    .test(
      "is-endDate-required",
      "stockmanagement.field.required",
      function (fieldVaue) {
        const { parameters } = this.parent;
        if (parameters) {
          let hasParameter = (parameters as string[]).some(
            (p) => p === ReportParameter.EndDate
          );
          return hasParameter === false || !!fieldVaue;
        }
        return true;
      }
    )
    .min(
      Yup.ref("startDate"),
      "stockmanagement.report.validation.enddatenotbeforestartdate"
    )
    .nullable(),

  locationUuid: Yup.string()
    .test(
      "is-location-required",
      "stockmanagement.field.required",
      function (fieldVaue) {
        const { parameters } = this.parent;
        if (parameters) {
          let hasParameter = (parameters as string[]).some(
            (p) => p === ReportParameter.Location
          );
          return hasParameter === false || (fieldVaue?.trim() ?? "").length > 0;
        }
        return true;
      }
    )
    .nullable(),

  inventoryGroupBy: Yup.string()
    .test(
      "is-inventorygroupby-required",
      "stockmanagement.field.required",
      function (fieldVaue) {
        const { parameters } = this.parent;
        if (parameters) {
          let hasParameter = (parameters as string[]).some(
            (p) => p === ReportParameter.InventoryGroupBy
          );
          return hasParameter === false || (fieldVaue?.trim() ?? "").length > 0;
        }
        return true;
      }
    )
    .nullable(),

  maxReorderLevelRatio: Yup.string()
    .test(
      "is-maxreorderlevelratio-required",
      "stockmanagement.field.required",
      function (fieldVaue) {
        const { parameters } = this.parent;
        if (parameters) {
          let hasParameter = (parameters as string[]).some(
            (p) => p === ReportParameter.MaxReorderLevelRatio
          );
          return (
            hasParameter === false ||
            ((fieldVaue?.trim() ?? "").length > 0 &&
              parseFloat(fieldVaue!) >= 0)
          );
        }
        return true;
      }
    )
    .nullable(),

  limit: Yup.string()
    .test(
      "is-limit-required",
      "stockmanagement.field.required",
      function (fieldVaue) {
        const { parameters } = this.parent;
        if (parameters) {
          let hasParameter = (parameters as string[]).some(
            (p) => p === ReportParameter.Limit
          );
          return (
            hasParameter === false ||
            ((fieldVaue?.trim() ?? "").length > 0 && parseInt(fieldVaue!) >= 0)
          );
        }
        return true;
      }
    )
    .nullable(),

  mostLeastMoving: Yup.string()
    .test(
      "is-mostleastmoving-required",
      "stockmanagement.field.required",
      function (fieldVaue) {
        const { parameters } = this.parent;
        if (parameters) {
          let hasParameter = (parameters as string[]).some(
            (p) => p === ReportParameter.MostLeastMoving
          );
          return hasParameter === false || (fieldVaue?.trim() ?? "").length > 0;
        }
        return true;
      }
    )
    .nullable(),

  fullFillment: Yup.array()
    .of(Yup.string())
    .test(
      "is-fullfillment-required",
      "stockmanagement.field.required",
      function (fieldValue) {
        const { parameters } = this.parent;
        if (parameters) {
          let hasParameter = (parameters as string[]).some(
            (p) => p === ReportParameter.Fullfillment
          );
          return hasParameter === false || (fieldValue ?? []).length > 0;
        }
        return true;
      }
    )
    .nullable(),
});
