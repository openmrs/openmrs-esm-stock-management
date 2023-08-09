import * as Yup from "yup";

const validationSchema = {
  hasSource: Yup.boolean(),
  hasDestination: Yup.boolean(),
  hasReason: Yup.boolean(),
  operationDate: Yup.date()
    .required("stockmanagement.stockoperation.validation.operationdaterequired")
    .max(
      Date(),
      "stockmanagement.stockoperation.validation.operationdatenotinthefuture"
    )
    .nullable(),
  // sourceUuid: Yup.string()
  //   .when("hasSource", {
  //     is: true,
  //     then: Yup.string().required("stockmanagement.field.required"),
  //   })
  //   .nullable(),
  // destinationUuid: Yup.string()
  //   .when("hasDestination", {
  //     is: true,
  //     then: Yup.string().required("stockmanagement.field.required"),
  //   })
  //   .nullable(),
  responsiblePersonUuid: Yup.string().required(
    "stockmanagement.field.required"
  ),
  responsiblePersonOther: Yup.string()
    .test(
      "is-other-person",
      "stockmanagement.field.required",
      function (otherText) {
        const { responsiblePersonUuid } = this.parent;
        return (
          responsiblePersonUuid !== "Other" ||
          (otherText?.trim() ?? "").length > 0
        );
      }
    )
    .nullable(),
  // reasonUuid: Yup.string()
  //   .when("hasReason", {
  //     is: true,
  //     then: Yup.string().required("stockmanagement.field.required"),
  //   })
  //   .nullable(),
  remarks: Yup.string()
    .nullable()
    .max(255, "stockmanagement.field.noexceed255"),
};

export const editValidationSchema = Yup.object(validationSchema);
