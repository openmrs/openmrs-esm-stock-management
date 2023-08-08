import {
  Checkbox,
  ComboBox,
  Form,
  Modal,
  NumberInput,
  TextInput,
} from "carbon-components-react";
import { Formik, FormikProps, FormikValues } from "formik";
import { produce } from "immer";
import React, { useCallback, useRef } from "react";
import {
  useCreateStockRuleMutation,
  useUpdateStockRuleMutation,
} from "../core/api/stockItem";
import { Party } from "../core/api/types/Party";
import { Role } from "../core/api/types/identity/Role";
import { StockItemPackagingUOMDTO } from "../core/api/types/stockItem/StockItemPackagingUOM";
import { StockRule } from "../core/api/types/stockItem/StockRule";
import { errorAlert, successAlert } from "../core/utils/alert";
import { toErrorMessage } from "../core/utils/stringUtils";
import useTranslation from "../core/utils/translation";
import {
  stockRulesCreateValidationSchema,
  stockRulesEditValidationSchema,
} from "./validationSchema";

export interface EditStockRuleProps {
  model: StockRule;
  setModel: React.Dispatch<React.SetStateAction<StockRule>>;
  isNew: boolean;
  setShowSplash: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedTab: React.Dispatch<React.SetStateAction<number>>;
  canEdit: boolean;
  packagingUnits: StockItemPackagingUOMDTO[];
  partyLookupList: Party[];
  roles: Role[];
  refreshRules: () => void;
  onCloseEditDialog: () => void;
  actions: {
    onGoBack: () => void;
    onSave: () => void;
  };
}

export const EditStockRule: React.FC<EditStockRuleProps> = ({
  model,
  setModel,
  isNew,
  canEdit,
  setShowSplash,
  setSelectedTab,
  actions,
  packagingUnits,
  partyLookupList,
  roles,
  onCloseEditDialog,
  refreshRules,
}) => {
  const { t } = useTranslation();
  const t2 = (token: any) => {
    if (token) return t(token!);
    return "";
  };

  const formikRef = useRef<FormikProps<FormikValues>>(null);
  const [createStockRule] = useCreateStockRuleMutation();
  const [updateStockRule] = useUpdateStockRuleMutation();

  const onLocationChanged = (data: { selectedItem: any }) => {
    let newValue = data.selectedItem?.locationUuid ?? data.selectedItem?.uuid;
    setModel(
      produce((draft) => {
        draft.locationName =
          data.selectedItem?.display ?? data.selectedItem?.name;
        draft.locationUuid = newValue;
      })
    );
    formikRef?.current?.setFieldValue("locationUuid", newValue);
  };

  const onPackagingUnitChanged = (data: { selectedItem: any }) => {
    let newValue =
      data.selectedItem?.uuid ?? data.selectedItem?.stockItemPackagingUOMUuid;
    setModel(
      produce((draft) => {
        draft.packagingUomName =
          data.selectedItem?.display ?? data?.selectedItem?.packagingUomName;
        draft.stockItemPackagingUOMUuid = newValue;
      })
    );
    formikRef?.current?.setFieldValue("stockItemPackagingUOMUuid", newValue);
  };

  const onQuantityFieldChange = (value: string | number) => {
    try {
      let qtyValue: number | null = null;
      if (typeof value === "number") {
        qtyValue = value;
      } else {
        qtyValue = value && value.length > 0 ? parseFloat(value) : null;
      }
      setModel(
        produce((draft) => {
          draft.quantity = qtyValue;
        })
      );
      formikRef?.current?.setFieldValue("quantity", qtyValue);
    } catch (e) {
      console.log(e);
    }
  };

  const onEvaluationFrequencyFieldChange = (value: string | number) => {
    try {
      let qtyValue: number | null = null;
      if (typeof value === "number") {
        qtyValue = value;
      } else {
        qtyValue = value && value.length > 0 ? parseInt(value) : null;
      }
      setModel(
        produce((draft) => {
          draft.evaluationFrequency = qtyValue;
        })
      );
      formikRef?.current?.setFieldValue("evaluationFrequency", qtyValue);
    } catch (e) {
      console.log(e);
    }
  };

  const onActionFrequencyFieldChange = (value: string | number) => {
    try {
      let qtyValue: number | null = null;
      if (typeof value === "number") {
        qtyValue = value;
      } else {
        qtyValue = value && value.length > 0 ? parseInt(value) : null;
      }
      setModel(
        produce((draft) => {
          draft.actionFrequency = qtyValue;
        })
      );
      formikRef?.current?.setFieldValue("actionFrequency", qtyValue);
    } catch (e) {
      console.log(e);
    }
  };

  const onNameChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = evt.target.value;
    setModel(
      produce((draft) => {
        draft.name = newValue;
      })
    );
    formikRef?.current?.setFieldValue("name", newValue);
  };

  const onAlertRoleChanged = (data: { selectedItem: any }) => {
    let newValue = data.selectedItem?.display ?? data.selectedItem?.role;
    setModel(
      produce((draft) => {
        draft.alertRole = newValue;
      })
    );

    formikRef?.current?.setFieldValue("alertRole", newValue);
  };

  const onMailRoleChanged = (data: { selectedItem: any }) => {
    let newValue = data.selectedItem?.display ?? data.selectedItem?.role;
    setModel(
      produce((draft) => {
        draft.mailRole = newValue;
      })
    );
    formikRef?.current?.setFieldValue("mailRole", newValue);
  };

  const onEnabledChanged = (
    cvt: React.ChangeEvent<HTMLInputElement>,
    data: { checked: boolean; id: string }
  ): void => {
    let newValue = !model.enabled;
    setModel(
      produce((draft) => {
        draft.enabled = newValue;
      })
    );
    formikRef?.current?.setFieldValue("enabled", newValue);
  };

  const onEnabledDescendantsChanged = (
    cvt: React.ChangeEvent<HTMLInputElement>,
    data: { checked: boolean; id: string }
  ): void => {
    let newValue = !model.enableDescendants;
    setModel(
      produce((draft) => {
        draft.enableDescendants = newValue;
      })
    );
    formikRef?.current?.setFieldValue("enableDescendants", newValue);
  };

  const handleSave = async () => {
    try {
      if (formikRef.current) {
        let success: boolean = true;
        await formikRef.current.validateForm().then(
          (e) => {
            if (!!!formikRef.current?.isValid) {
              success = false;
              setTimeout(() => {
                Object.keys(e).forEach((p) => {
                  formikRef.current?.setFieldTouched(p, true, true);
                });
              });
            }
          },
          (f) => {
            success = false;
          }
        );
        if (success) {
          setShowSplash(true);
          handleSaveStockRule(model);
        }
      }
    } finally {
    }
  };

  const handleSaveStockRule = useCallback(
    async (stockRule: StockRule) => {
      let hideSplash = true;
      try {
        if (!stockRule.uuid && stockRule.locationUuid == null) return;
        let newItem = {
          name: stockRule.name,
          description: stockRule.description,
          quantity: stockRule.quantity,
          stockItemPackagingUOMUuid: stockRule.stockItemPackagingUOMUuid,
          enabled: stockRule.enabled,
          evaluationFrequency: stockRule.evaluationFrequency,
          actionFrequency: stockRule.actionFrequency,
          alertRole: stockRule.alertRole,
          mailRole: stockRule.mailRole,
          enableDescendants: stockRule.enableDescendants,
        } as any;

        if (!stockRule.uuid) {
          newItem["locationUuid"] = stockRule.locationUuid;
          newItem["stockItemUuid"] = stockRule.stockItemUuid;
        }
        await (!stockRule.uuid
          ? createStockRule(newItem)
          : updateStockRule({ model: newItem, uuid: stockRule.uuid! })
        )
          .unwrap()
          .then((payload: any) => {
            if ((payload as any).error) {
              var errorToken = toErrorMessage(payload);
              errorAlert(
                `${t(
                  !model.uuid
                    ? "stockmanagement.stockitem.stockrulecreatefailed"
                    : "stockmanagement.stockitem.stockruleupdatefailed"
                )} ${errorToken}`
              );
              return;
            } else {
              successAlert(
                `${t(
                  !model.uuid
                    ? "stockmanagement.stockitem.stockrulecreatesuccess"
                    : "stockmanagement.stockitem.stockruleupdatesuccess"
                )}`
              );
              refreshRules();
              onCloseEditDialog();
            }
          })
          .catch((error) => {
            var errorToken = toErrorMessage(error);
            errorAlert(
              `${t(
                !model.uuid
                  ? "stockmanagement.stockitem.stockrulecreatefailed"
                  : "stockmanagement.stockitem.stockruleupdatefailed"
              )} ${errorToken}`
            );
            return;
          });
        setShowSplash(false);
        hideSplash = false;
      } finally {
        if (hideSplash) {
          setShowSplash(false);
        }
      }
    },
    [
      createStockRule,
      updateStockRule,
      setShowSplash,
      t,
      model.uuid,
      refreshRules,
      onCloseEditDialog,
    ]
  );

  return (
    <>
      <Modal
        open={true}
        size="lg"
        primaryButtonText={t("stockmanagement.save")}
        secondaryButtonText={t("stockmanagement.cancel")}
        primaryButtonDisabled={false}
        modalLabel={
          model.uuid ? t("stockmanagement.stockitem.stockrule.edit.title") : ""
        }
        modalHeading={
          model.uuid
            ? model.name
            : t("stockmanagement.stockitem.stockrule.new.title")
        }
        onRequestClose={onCloseEditDialog}
        shouldSubmitOnEnter={false}
        onRequestSubmit={handleSave}
        onSecondarySubmit={onCloseEditDialog}
      >
        <Formik
          innerRef={formikRef}
          validationSchema={
            isNew
              ? stockRulesCreateValidationSchema
              : stockRulesEditValidationSchema
          }
          initialValues={{
            locationUuid: model.locationUuid,
            name: model.name,
            quantity: model.quantity,
            stockItemPackagingUOMUuid: model.stockItemPackagingUOMUuid,
            evaluationFrequency: model.evaluationFrequency,
            actionFrequency: model.actionFrequency,
            alertRole: model.alertRole,
            mailRole: model?.mailRole,
          }}
          onSubmit={(values) => {
            formikRef?.current?.setSubmitting(false);
          }}
        >
          {({
            errors,
            touched,
            validateField,
            validateForm,
            handleSubmit,
            isSubmitting,
          }) => (
            <Form className="smt-form" onSubmit={handleSubmit}>
              <div className="smt-form-columns">
                <div>
                  {canEdit && isNew && (
                    <ComboBox
                      titleText={t(
                        "stockmanagement.stockitem.stockrule.location"
                      )}
                      id="stockRulelocation"
                      initialSelectedItem={
                        model.locationUuid
                          ? ({
                              uuid: model.locationUuid,
                              display: model.locationName,
                            } as any)
                          : null
                      }
                      selectedItem={
                        model.locationUuid
                          ? {
                              uuid: model.locationUuid,
                              display: model.locationName,
                            }
                          : null
                      }
                      items={
                        model.locationUuid
                          ? [
                              ...(partyLookupList.some(
                                (x) => x.locationUuid === model.locationUuid
                              )
                                ? []
                                : [
                                    {
                                      uuid: model.locationUuid,
                                      display: model.locationName,
                                    },
                                  ]),
                              ...(partyLookupList ?? []),
                            ]
                          : partyLookupList
                      }
                      onChange={(data: { selectedItem: any }) =>
                        onLocationChanged(data)
                      }
                      shouldFilterItem={(data) => true}
                      itemToString={(item) => item?.display ?? item?.name ?? ""}
                      placeholder={"Filter..."}
                      invalid={touched.locationUuid && !!errors.locationUuid}
                      invalidText={t2(errors.locationUuid)}
                    />
                  )}
                  {(!canEdit || !isNew) && (
                    <TextInput
                      id="stockRulelocationLbl"
                      value={model.locationName}
                      readOnly={true}
                      labelText={t(
                        "stockmanagement.stockitem.stockrule.location"
                      )}
                    />
                  )}

                  <TextInput
                    id="stockRulelocationLbl"
                    readOnly={!canEdit}
                    maxLength={255}
                    onChange={(e) => onNameChange(e)}
                    value={model.name ?? ""}
                    labelText={t("stockmanagement.stockitem.stockrule.name")}
                    invalid={touched.name && !!errors.name}
                    invalidText={t2(errors.name)}
                  />

                  {canEdit && (
                    <ComboBox
                      titleText={t(
                        "stockmanagement.stockitem.stockrule.quantityunit"
                      )}
                      id="stockRulePackaging"
                      initialSelectedItem={
                        model.stockItemPackagingUOMUuid
                          ? ({
                              uuid: model.stockItemPackagingUOMUuid,
                              display: model.packagingUomName,
                            } as any)
                          : null
                      }
                      selectedItem={
                        model.stockItemPackagingUOMUuid
                          ? {
                              uuid: model.stockItemPackagingUOMUuid,
                              display: model.packagingUomName,
                            }
                          : null
                      }
                      items={
                        model.stockItemPackagingUOMUuid
                          ? [
                              ...(packagingUnits.some(
                                (x) =>
                                  x.uuid === model.stockItemPackagingUOMUuid
                              )
                                ? []
                                : [
                                    {
                                      uuid: model.stockItemPackagingUOMUuid,
                                      display: model.packagingUomName,
                                    },
                                  ]),
                              ...(packagingUnits ?? []),
                            ]
                          : packagingUnits
                      }
                      onChange={(data: { selectedItem: any }) =>
                        onPackagingUnitChanged(data)
                      }
                      shouldFilterItem={(data) => true}
                      itemToString={(item) =>
                        item?.display ?? item?.packagingUomName
                      }
                      placeholder={"Filter..."}
                      invalid={
                        touched.stockItemPackagingUOMUuid &&
                        !!errors.stockItemPackagingUOMUuid
                      }
                      invalidText={t2(errors.stockItemPackagingUOMUuid)}
                    />
                  )}
                  {!canEdit && (
                    <TextInput
                      id="stockRulePackagingLbl"
                      value={model.packagingUomName ?? ""}
                      readOnly={true}
                      labelText={t(
                        "stockmanagement.stockitem.stockrule.quantityunit"
                      )}
                    />
                  )}

                  <NumberInput
                    id="stockRuleQty"
                    allowEmpty={true}
                    readOnly={!canEdit}
                    onChange={(e: any, d: any) =>
                      onQuantityFieldChange(e?.target?.value)
                    }
                    value={model?.quantity ?? ""}
                    label={t("stockmanagement.stockitem.stockrule.quantity")}
                    invalid={touched.quantity && !!errors.quantity}
                    invalidText={t2(errors.quantity)}
                  />

                  <div style={{ display: "flex", flexDirection: "row" }}>
                    {canEdit && (
                      <Checkbox
                        id="stockRuleDescendants"
                        checked={model.enableDescendants ?? false}
                        onChange={(
                          e: React.ChangeEvent<HTMLInputElement>,
                          d: { checked: boolean; id: string }
                        ) => onEnabledDescendantsChanged(e, d)}
                        labelText={t(
                          "stockmanagement.stockitem.stockrule.edit.enableeescendants"
                        )}
                      />
                    )}

                    {!canEdit && (
                      <TextInput
                        id="stockRuleDescendantsLbl"
                        value={t(
                          model.enableDescendants
                            ? "stockmanagement.yes"
                            : "stockmanagement.no"
                        )}
                        readOnly={true}
                        labelText={t(
                          "stockmanagement.stockitem.stockrule.edit.enabledescendants"
                        )}
                      />
                    )}

                    {canEdit && (
                      <Checkbox
                        id="stockRuleEnable"
                        checked={model.enabled ?? false}
                        onChange={(
                          e: React.ChangeEvent<HTMLInputElement>,
                          d: { checked: boolean; id: string }
                        ) => onEnabledChanged(e, d)}
                        labelText={t(
                          "stockmanagement.stockitem.stockrule.enable"
                        )}
                      />
                    )}

                    {!canEdit && (
                      <TextInput
                        id="stockRuleEnableLbl"
                        value={t(
                          model.enabled
                            ? "stockmanagement.yes"
                            : "stockmanagement.no"
                        )}
                        readOnly={true}
                        labelText={t(
                          "stockmanagement.stockitem.stockrule.enable"
                        )}
                      />
                    )}
                  </div>
                </div>
                <div>
                  {canEdit && (
                    <ComboBox
                      titleText={t(
                        "stockmanagement.stockitem.stockrule.alertrole"
                      )}
                      id="stockRuleAlertRole"
                      initialSelectedItem={
                        model.alertRole
                          ? ({
                              uuid: model.alertRole,
                              display: model.alertRole,
                            } as any)
                          : null
                      }
                      selectedItem={
                        model.alertRole
                          ? {
                              uuid: model.alertRole,
                              display: model.alertRole,
                            }
                          : null
                      }
                      items={
                        model.alertRole
                          ? [
                              ...(roles?.some((x) => x.role === model.alertRole)
                                ? []
                                : [
                                    {
                                      uuid: model.alertRole,
                                      display: model.alertRole,
                                    },
                                  ]),
                              ...(roles ?? []),
                            ]
                          : roles
                      }
                      onChange={(data: { selectedItem: any }) =>
                        onAlertRoleChanged(data)
                      }
                      shouldFilterItem={(data) => true}
                      itemToString={(item) =>
                        item?.display ?? item?.alertRole ?? ""
                      }
                      placeholder={"Type to search..."}
                      invalid={touched.alertRole && !!errors.alertRole}
                      invalidText={t2(errors.alertRole)}
                    />
                  )}
                  {!canEdit && (
                    <TextInput
                      id="stockRuleAlertRoleLbl"
                      value={model.alertRole ?? ""}
                      readOnly={true}
                      labelText={t(
                        "stockmanagement.stockitem.stockrule.alertrole"
                      )}
                    />
                  )}

                  {canEdit && (
                    <>
                      <ComboBox
                        titleText={t(
                          "stockmanagement.stockitem.stockrule.mailrole"
                        )}
                        id="stockRuleMailrole"
                        initialSelectedItem={
                          model.mailRole
                            ? ({
                                uuid: model.mailRole,
                                display: model.mailRole,
                              } as any)
                            : null
                        }
                        selectedItem={
                          model.mailRole
                            ? {
                                uuid: model.mailRole,
                                display: model.mailRole,
                              }
                            : null
                        }
                        items={
                          model.mailRole
                            ? [
                                ...(roles?.some(
                                  (x) => x.role === model.mailRole
                                )
                                  ? []
                                  : [
                                      {
                                        uuid: model.mailRole,
                                        display: model.mailRole,
                                      },
                                    ]),
                                ...(roles ?? []),
                              ]
                            : roles
                        }
                        onChange={onMailRoleChanged}
                        shouldFilterItem={(data) => true}
                        itemToString={(item) =>
                          item?.display ?? item?.mailRole ?? ""
                        }
                        placeholder={"Type to search..."}
                        invalid={touched.mailRole && !!errors.mailRole}
                        invalidText={t2(errors.mailRole)}
                      />
                    </>
                  )}
                  {!canEdit && (
                    <TextInput
                      id="stockRuleMailroleLbl"
                      value={model.mailRole ?? ""}
                      readOnly={true}
                      labelText={t(
                        "stockmanagement.stockitem.stockrule.mailrole"
                      )}
                    />
                  )}

                  <NumberInput
                    id="stockRuleQtyevaluationFrequency"
                    allowEmpty={true}
                    readOnly={!canEdit}
                    onChange={(e: any, d: any) =>
                      onEvaluationFrequencyFieldChange(e?.target?.value)
                    }
                    value={model.evaluationFrequency ?? ""}
                    label={t(
                      "stockmanagement.stockitem.stockrule.edit.evaluationfrequency"
                    )}
                    invalid={
                      touched.evaluationFrequency &&
                      !!errors.evaluationFrequency
                    }
                    invalidText={t2(errors.evaluationFrequency)}
                  />

                  <NumberInput
                    id="stockRuleQtyactionFrequency"
                    allowEmpty={true}
                    readOnly={!canEdit}
                    onChange={(e: any, d: any) =>
                      onActionFrequencyFieldChange(e?.target?.value)
                    }
                    value={model?.actionFrequency ?? ""}
                    label={t(
                      "stockmanagement.stockitem.stockrule.edit.actionfrequency"
                    )}
                    invalid={
                      touched.actionFrequency && !!errors.actionFrequency
                    }
                    invalidText={t2(errors.actionFrequency)}
                  />
                </div>
              </div>
              <div>
                <p style={{ width: "100%", marginTop: "1rem" }}>
                  {t("stockmanagement.stockitem.stockrule.description")}
                </p>
              </div>
            </Form>
          )}
        </Formik>
      </Modal>
    </>
  );
};
