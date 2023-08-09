import { ArrowRight24, Save24, Undo24 } from "@carbon/icons-react";
import {
  Button,
  ComboBox,
  DatePicker,
  DatePickerInput,
  Form,
  Select,
  SelectItem,
  SelectSkeleton,
  TextArea,
  TextInput,
} from "@carbon/react";
import { Formik, FormikProps, FormikValues } from "formik";
import { debounce } from "lodash-es";
import React, { ChangeEvent, useEffect, useMemo, useRef } from "react";
import { STOCK_ADJUSTMENT_REASON_CODED_CONCEPT_ID } from "../constants";
import { ResourceRepresentation } from "../core/api/api";
import {
  UserFilterCriteria,
  useLazyGetConceptByIdQuery,
  useLazyGetUsersQuery,
} from "../core/api/lookups";
import { Party } from "../core/api/types/Party";
import { User } from "../core/api/types/identity/User";
import { StockItemInventory } from "../core/api/types/stockItem/StockItemInventory";
import { LocationTypeLocation } from "../core/api/types/stockOperation/LocationType";
import { StockOperationDTO } from "../core/api/types/stockOperation/StockOperationDTO";
import {
  StockOperationType,
  StockOperationTypeRequiresStockAdjustmentReason,
} from "../core/api/types/stockOperation/StockOperationType";
import {
  DATE_PICKER_CONTROL_FORMAT,
  DATE_PICKER_FORMAT,
  formatForDatePicker,
  today,
} from "../core/utils/datetimeUtils";
import useTranslation from "../core/utils/translation";
import { editValidationSchema } from "./validationSchema";

export interface EditStockOperationProps {
  model: StockOperationDTO;
  setModel: React.Dispatch<React.SetStateAction<StockOperationDTO>>;
  isNew: boolean;
  hasItems: boolean;
  locked: boolean;
  atLocation: string | null | undefined;
  setAtLocation: React.Dispatch<
    React.SetStateAction<string | null | undefined>
  >;
  setBatchBalance: React.Dispatch<
    React.SetStateAction<{ [key: string]: StockItemInventory }>
  >;
  setShowSplash: React.Dispatch<React.SetStateAction<boolean>>;
  setShowItems: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedTab: React.Dispatch<React.SetStateAction<number>>;
  currentStockOperationType: StockOperationType | null | undefined;
  requireStockAdjustmentReason: boolean;
  canEdit: boolean;
  sourcePartyList?: Party[];
  lockSource: boolean;
  destinationPartyList?: Party[];
  lockDestination: boolean;
  actions: {
    onGoBack: () => void;
    onSave: () => void;
  };
}

const maxDate: Date = today();
const otherUser: User = {
  uuid: "Other",
  display: "Other",
} as any as User;

export const EditStockOperation: React.FC<EditStockOperationProps> = ({
  model,
  setModel,
  isNew,
  hasItems,
  locked,
  currentStockOperationType,
  canEdit,
  sourcePartyList,
  lockSource,
  destinationPartyList,
  lockDestination,
  setShowItems,
  setShowSplash,
  setSelectedTab,
  actions,
  requireStockAdjustmentReason,
  atLocation,
  setAtLocation,
  setBatchBalance,
}) => {
  const { t } = useTranslation();
  const t2 = (token: any) => {
    if (token) return t(token!);
    return "";
  };
  const formikRef = useRef<FormikProps<FormikValues>>(null);
  const [getUsersQuery, { data: usersList }] = useLazyGetUsersQuery();
  const handleUsersSearch = useMemo(
    () =>
      debounce((searchTerm, name?: string | null) => {
        if (name && name === searchTerm) return;
        getUsersQuery({
          v: ResourceRepresentation.Default,
          q: searchTerm,
        } as any as UserFilterCriteria);
      }, 300),
    [getUsersQuery]
  );
  const [
    getStockAdjustmentReasons,
    {
      data: stockAdjustmentReasons,
      isFetching: isFetchingStockAdjustmentReasons,
    },
  ] = useLazyGetConceptByIdQuery();

  useEffect(() => {
    if (requireStockAdjustmentReason) {
      getStockAdjustmentReasons(STOCK_ADJUSTMENT_REASON_CODED_CONCEPT_ID);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requireStockAdjustmentReason]);

  const onOperationDateChange = (dates: Date[]): void => {
    setShowItems(false);
    setModel({ ...model, operationDate: dates[0] });
    formikRef?.current?.setFieldValue("operationDate", dates[0]);
  };

  const updateAtLocation = (locationUuid: string, isSource: boolean) => {
    if (isSource && atLocation !== locationUuid) {
      if (
        currentStockOperationType?.hasSource &&
        LocationTypeLocation === currentStockOperationType?.sourceType
      ) {
        setAtLocation(locationUuid);
        setBatchBalance({});
      }
    }
    if (!isSource && atLocation !== locationUuid) {
      if (
        !(
          currentStockOperationType?.hasSource &&
          LocationTypeLocation === currentStockOperationType?.sourceType
        ) &&
        currentStockOperationType?.hasDestination &&
        LocationTypeLocation === currentStockOperationType?.destinationType
      ) {
        setAtLocation(locationUuid);
        setBatchBalance({});
      }
    }
  };

  const onSourceChange = (data: { selectedItem: Party }) => {
    setShowItems(false);
    let party = data.selectedItem;
    setModel({ ...model, sourceUuid: party?.uuid, sourceName: party?.name });
    formikRef?.current?.setFieldValue("sourceUuid", party?.uuid);
    updateAtLocation(party?.locationUuid, true);
  };

  const onDestinationChange = (data: { selectedItem: Party }) => {
    setShowItems(false);
    let party = data.selectedItem;
    setModel({
      ...model,
      destinationUuid: party?.uuid,
      destinationName: party?.name,
    });
    formikRef?.current?.setFieldValue("destinationUuid", party?.uuid);
    updateAtLocation(party?.locationUuid, false);
  };

  const onResponsiblePersonChanged = (data: { selectedItem: User }) => {
    setShowItems(false);
    let responsiblePersonOther: string | null | undefined =
      model.responsiblePersonOther;
    let responsiblePersonUuid: string = data.selectedItem?.uuid;
    let responsiblePersonFamilyName =
      data.selectedItem?.person?.display ?? data.selectedItem?.display;
    if (data.selectedItem?.uuid !== otherUser.uuid) {
      responsiblePersonOther = null;
    }

    setModel({
      ...model,
      responsiblePersonUuid: responsiblePersonUuid,
      responsiblePersonFamilyName: responsiblePersonFamilyName,
      responsiblePersonOther: responsiblePersonOther,
    });
    formikRef?.current?.setFieldValue(
      "responsiblePersonUuid",
      data.selectedItem?.uuid
    );
    formikRef?.current?.setFieldValue(
      "responsiblePersonOther",
      responsiblePersonOther
    );
  };

  const onResponsiblePersonOtherChanged = (
    evt: React.ChangeEvent<HTMLInputElement>
  ) => {
    setShowItems(false);
    setModel({ ...model, responsiblePersonOther: evt.target.value });
    formikRef?.current?.setFieldValue(
      "responsiblePersonOther",
      evt.target.value
    );
  };

  const onRemarksChange = (evt: React.ChangeEvent<HTMLTextAreaElement>) => {
    setShowItems(false);
    setModel({ ...model, remarks: evt.target.value });
    formikRef?.current?.setFieldValue("remarks", evt.target.value);
  };

  const onReasonChange = (evt: ChangeEvent<HTMLSelectElement>) => {
    setShowItems(false);
    let selectedSourceType = (
      stockAdjustmentReasons?.answers &&
      stockAdjustmentReasons?.answers.length > 0
        ? stockAdjustmentReasons?.answers
        : stockAdjustmentReasons?.setMembers
    )?.find((x) => x.uuid === evt.target.value);
    setModel({
      ...model,
      reasonUuid: selectedSourceType?.uuid,
      reasonName: selectedSourceType?.display,
    });
    formikRef?.current?.setFieldValue("reasonUuid", selectedSourceType?.uuid);
  };

  const handleSave = async () => {
    try {
      if (formikRef.current) {
        let success: boolean = true;
        await formikRef.current.validateForm().then(
          (e) => {
            if (!!!formikRef.current?.isValid) {
              success = false;
            }
          },
          (f) => {
            success = false;
          }
        );
        if (success) {
          actions.onSave();
        }
      }
    } finally {
    }
  };

  return (
    <Formik
      innerRef={formikRef}
      validationSchema={editValidationSchema}
      initialValues={{
        hasSource: currentStockOperationType?.hasSource ?? false,
        hasDestination: currentStockOperationType?.hasDestination ?? false,
        hasReason: StockOperationTypeRequiresStockAdjustmentReason(
          currentStockOperationType?.operationType!
        ),
        operationTypeUuid: model?.operationTypeUuid,
        operationDate: model?.operationDate,
        sourceUuid: model?.sourceUuid,
        destinationUuid: model?.destinationUuid,
        responsiblePersonUuid: model?.responsiblePersonUuid,
        responsiblePersonOther: model?.responsiblePersonOther,
        remarks: model?.remarks,
        reasonUuid: model?.reasonUuid,
      }}
      onSubmit={(values) => {
        setShowItems(true);
        setSelectedTab(1);
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
          {canEdit && (
            <DatePicker
              datePickerType="single"
              maxDate={formatForDatePicker(maxDate)}
              locale="en"
              dateFormat={DATE_PICKER_CONTROL_FORMAT}
              onChange={onOperationDateChange}
            >
              <DatePickerInput
                invalid={touched.operationDate && !!errors.operationDate}
                invalidText={t2(errors.operationDate)}
                id="operationDate"
                name="operationDate"
                placeholder={DATE_PICKER_FORMAT}
                labelText={t(
                  "stockmanagement.stockoperation.edit.operationdate"
                )}
                value={formatForDatePicker(model?.operationDate)}
              />
            </DatePicker>
          )}

          {!canEdit && (
            <>
              <TextInput
                id="operationDateLbl"
                value={formatForDatePicker(model?.operationDate)}
                readOnly={true}
                labelText={t(
                  "stockmanagement.stockoperation.edit.operationdate"
                )}
              />
            </>
          )}

          {!isNew && model?.operationNumber && (
            <TextInput
              id="operationNoLbl"
              value={model?.operationNumber}
              readOnly={true}
              labelText={t(
                "stockmanagement.stockoperation.edit.operationnumber"
              )}
            />
          )}

          {canEdit && !lockSource && currentStockOperationType?.hasSource && (
            <>
              <ComboBox
                titleText={t(
                  currentStockOperationType?.hasDestination
                    ? "stockmanagement.stockoperation.edit.source"
                    : "stockmanagement.stockoperation.edit.location"
                )}
                invalid={touched.sourceUuid && !!errors.sourceUuid}
                invalidText={t2(errors.sourceUuid)}
                name="sourceUuid"
                className="select-field"
                id="sourceUuid"
                items={sourcePartyList!}
                onChange={onSourceChange}
                initialSelectedItem={sourcePartyList?.find(
                  (p) => p.uuid === model.sourceUuid
                )}
                itemToString={(item) => (item ? `${item?.name}` : "")}
                placeholder={t(
                  currentStockOperationType?.hasDestination
                    ? "stockmanagement.stockoperation.new.sourceplaceholder"
                    : "stockmanagement.stockoperation.new.locationplaceholder"
                )}
              />
            </>
          )}
          {(!canEdit || lockSource) && currentStockOperationType?.hasSource && (
            <TextInput
              id="sourceUuidLbl"
              value={model?.sourceName ?? ""}
              readOnly={true}
              labelText={t(
                currentStockOperationType?.hasDestination
                  ? "stockmanagement.stockoperation.edit.source"
                  : "stockmanagement.stockoperation.edit.location"
              )}
            />
          )}

          {canEdit &&
            !lockDestination &&
            currentStockOperationType?.hasDestination && (
              <ComboBox
                titleText={t(
                  currentStockOperationType?.hasSource
                    ? "stockmanagement.stockoperation.edit.destination"
                    : "stockmanagement.stockoperation.edit.location"
                )}
                invalid={touched.destinationUuid && !!errors.destinationUuid}
                invalidText={t2(errors.destinationUuid)}
                name="destinationUuid"
                className="select-field"
                id="destinationUuid"
                items={destinationPartyList!}
                onChange={onDestinationChange}
                initialSelectedItem={destinationPartyList?.find(
                  (p) => p.uuid === model.destinationUuid
                )}
                itemToString={(item) => (item ? `${item?.name}` : "")}
                placeholder={t(
                  currentStockOperationType?.hasSource
                    ? "stockmanagement.stockoperation.new.destinationplaceholder"
                    : "stockmanagement.stockoperation.new.locationplaceholder"
                )}
              />
            )}
          {(!canEdit || lockDestination) &&
            currentStockOperationType?.hasDestination && (
              <TextInput
                id="destinationUuidLbl"
                value={model?.destinationName ?? ""}
                readOnly={true}
                labelText={t(
                  currentStockOperationType?.hasSource
                    ? "stockmanagement.stockoperation.edit.destination"
                    : "stockmanagement.stockoperation.edit.location"
                )}
              />
            )}

          {canEdit && (
            <>
              <ComboBox
                titleText={t(
                  "stockmanagement.stockoperation.edit.responsibleperson"
                )}
                invalid={
                  touched.responsiblePersonUuid &&
                  !!errors.responsiblePersonUuid
                }
                invalidText={t2(errors.responsiblePersonUuid)}
                name="responsiblePersonUuid"
                id="responsiblePersonUuid"
                initialSelectedItem={
                  model?.responsiblePersonUuid || model?.responsiblePersonOther
                    ? ({
                        uuid: model?.responsiblePersonUuid ?? otherUser.uuid,
                        display: model?.responsiblePersonFamilyName
                          ? `${model?.responsiblePersonFamilyName} ${model?.responsiblePersonGivenName}`
                          : otherUser.display,
                      } as any as User)
                    : null
                }
                items={[...(usersList?.results ?? []), otherUser]}
                onChange={onResponsiblePersonChanged}
                shouldFilterItem={(data) => true}
                onFocus={() => usersList?.results || handleUsersSearch("")}
                onToggleClick={() =>
                  usersList?.results || handleUsersSearch("")
                }
                onInputChange={(e) =>
                  handleUsersSearch(e, model?.responsiblePersonFamilyName)
                }
                itemToString={(item) =>
                  `${item?.person?.display ?? item?.display ?? ""}`
                }
                placeholder={"Filter..."}
              />
              {model?.responsiblePersonUuid === otherUser.uuid && (
                <TextInput
                  id="responsiblePersonOther"
                  name="responsiblePersonOther"
                  invalid={
                    touched.responsiblePersonOther &&
                    !!errors.responsiblePersonOther
                  }
                  invalidText={t2(errors.responsiblePersonOther)}
                  onChange={onResponsiblePersonOtherChanged}
                  value={model?.responsiblePersonOther ?? ""}
                  labelText={t("stockmanagement.pleasespecify")}
                />
              )}
            </>
          )}
          {!canEdit && (
            <TextInput
              id="responsiblePersonLbl"
              value={
                (model?.responsiblePersonUuid &&
                model?.responsiblePersonUuid !== otherUser.uuid
                  ? `${model?.responsiblePersonFamilyName} ${model?.responsiblePersonGivenName}`
                  : model?.responsiblePersonOther) ?? ""
              }
              readOnly={true}
              labelText={t(
                "stockmanagement.stockoperation.edit.responsibleperson"
              )}
            />
          )}

          {requireStockAdjustmentReason && canEdit && (
            <>
              {isFetchingStockAdjustmentReasons && <SelectSkeleton hideLabel />}
              {!isFetchingStockAdjustmentReasons && (
                <Select
                  invalid={touched.reasonUuid && !!errors.reasonUuid}
                  invalidText={t2(errors.reasonUuid)}
                  name="reasonUuid"
                  className="select-field"
                  labelText={t("stockmanagement.stockoperation.edit.reason")}
                  id="reasonUuid"
                  value={model.reasonUuid ?? "placeholder-item"}
                  onChange={onReasonChange}
                >
                  <SelectItem
                    disabled
                    hidden
                    value="placeholder-item"
                    text={t(
                      "stockmanagement.stockoperation.new.reasonplaceholder"
                    )}
                  />
                  {(stockAdjustmentReasons?.answers &&
                  stockAdjustmentReasons?.answers.length > 0
                    ? stockAdjustmentReasons?.answers
                    : stockAdjustmentReasons?.setMembers
                  )?.map((concept) => {
                    return (
                      <SelectItem
                        key={concept.uuid}
                        value={concept.uuid}
                        text={concept.display}
                      />
                    );
                  })}
                </Select>
              )}
            </>
          )}

          {requireStockAdjustmentReason && !canEdit && (
            <TextInput
              id="reasonUuidLbl"
              value={model?.reasonName ?? ""}
              readOnly={true}
              labelText={t("stockmanagement.stockoperation.edit.reason")}
            />
          )}

          <TextArea
            id="remarks"
            name="remarks"
            value={model?.remarks ?? ""}
            invalid={touched.remarks && !!errors.remarks}
            invalidText={t2(errors.remarks)}
            onChange={onRemarksChange}
            readOnly={!canEdit}
            maxLength={255}
            labelText={t("stockmanagement.stockoperation.edit.remarks")}
          />
          {canEdit && !locked && (
            <div className="stkpg-form-buttons">
              {!isSubmitting && (
                <>
                  {
                    <Button
                      name="continue"
                      type="submit"
                      className="submitButton"
                      onClick={handleSubmit}
                      kind="primary"
                      renderIcon={ArrowRight24}
                    >
                      {t("stockmanagement.next")}
                    </Button>
                  }
                  {hasItems && (
                    <Button
                      name="save"
                      type="submit"
                      className="submitButton"
                      onClick={handleSave}
                      kind="secondary"
                      renderIcon={Save24}
                    >
                      {t("stockmanagement.save")}
                    </Button>
                  )}
                  <Button
                    type="button"
                    className="cancelButton"
                    kind="tertiary"
                    onClick={actions.onGoBack}
                    renderIcon={Undo24}
                  >
                    {t("stockmanagement.goback")}
                  </Button>
                </>
              )}
            </div>
          )}
        </Form>
      )}
    </Formik>
  );
};
