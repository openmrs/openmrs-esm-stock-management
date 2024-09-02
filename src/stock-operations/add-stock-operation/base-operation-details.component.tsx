import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { StockOperationDTO } from "../../core/api/types/stockOperation/StockOperationDTO";
import { SaveStockOperation } from "../../stock-items/types";
import {
  operationFromString,
  StockOperationType,
} from "../../core/api/types/stockOperation/StockOperationType";
import {
  DATE_PICKER_CONTROL_FORMAT,
  DATE_PICKER_FORMAT,
  formatForDatePicker,
  today,
} from "../../constants";
import {
  Button,
  DatePicker,
  DatePickerInput,
  InlineLoading,
  TextInput,
} from "@carbon/react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { operationSchema, StockOperationFormData } from "../validation-schema";
import { ArrowRight } from "@carbon/react/icons";
import PartySelector from "../party-selector/party-selector.component";
import UsersSelector from "../users-selector/users-selector.component";
import { otherUser } from "../../core/utils/utils";
import ControlledTextInput from "../../core/components/carbon/controlled-text-input/controlled-text-input.component";
import StockOperationReasonSelector from "../stock-operation-reason-selector/stock-operation-reason-selector.component";
import ControlledTextArea from "../../core/components/carbon/controlled-text-area/controlled-text-area.component";
import { InitializeResult } from "./types";
import { ResourceRepresentation } from "../../core/api/api";
import { useStockOperationPages } from "../stock-operations-table.resource";
import { createBaseOperationPayload } from "./add-stock-utils";
import { showSnackbar, useSession } from "@openmrs/esm-framework";

import { Party } from "../../core/api/types/Party";
import styles from "../add-stock-operation/base-operation-details.scss";

interface BaseOperationDetailsProps {
  isEditing?: boolean;
  canEdit?: boolean;
  model?: StockOperationDTO;
  onSave?: SaveStockOperation;
  operation: StockOperationType;
  setup: InitializeResult;
}

const BaseOperationDetails: React.FC<BaseOperationDetailsProps> = ({
  model,
  onSave,
  operation,
  canEdit,
  isEditing,
  setup: {
    requiresStockAdjustmentReason: showReason,
    sourcePartyList,
    destinationPartyList,
  },
}) => {
  const { t } = useTranslation();
  const { isLoading } = useStockOperationPages({
    v: ResourceRepresentation.Full,
    totalCount: true,
  });
  const operationType = operationFromString(operation?.operationType);
  const issueStockOperation = mapIssueStockLocations(model);
  const { user } = useSession();
  const defaultLoggedUserUuid = user.uuid;

  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue,
  } = useForm<StockOperationFormData>({
    defaultValues: operationType === "stockissue" ? issueStockOperation : model,
    mode: "all",
    resolver: zodResolver(operationSchema(operationType)),
  });

  const [isOtherUser, setIsOtherUser] = useState<boolean | null>();
  const [isSaving, setIsSaving] = useState(false);
  useEffect(() => {
    if (defaultLoggedUserUuid) {
      setValue("responsiblePersonUuid", defaultLoggedUserUuid);
    }
  }, [defaultLoggedUserUuid, setValue]);

  if (isLoading) {
    return (
      <InlineLoading
        status="active"
        iconDescription="Loading"
        description={t("loadingData", "Loading data...")}
      />
    );
  }

  const handleSave = async (item: StockOperationDTO) => {
    try {
      setIsSaving(true);
      const payload = createBaseOperationPayload(model, item, operationType);
      await onSave(payload);
    } catch (e) {
      showSnackbar({
        title: t("errorSavingBaseOperation", "Error saving base operation"),
        isLowContrast: true,
        kind: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const isCompleteStatus = model?.status === "COMPLETED";
  const sourceTags =
    operation?.stockOperationTypeLocationScopes
      ?.filter((p) => operation?.hasSource && p.isSource)
      .map((p) => p.locationTag) ?? [];

  const destinationTags =
    operation?.stockOperationTypeLocationScopes
      ?.filter((p) => operation?.hasDestination && p.isDestination)
      .map((p) => p.locationTag) ?? [];

  const sourcePartyListFilter = (sourcePartyList: Party) => {
    const isValid =
      (sourcePartyList.locationUuid &&
        operation?.sourceType === "Location" &&
        (sourceTags.length === 0 ||
          (sourcePartyList.tags &&
            sourceTags.some((x) => sourcePartyList.tags.includes(x))))) ||
      (sourcePartyList.stockSourceUuid && operation?.sourceType === "Other");
    return isValid;
  };

  const destinationPartyListFilter = (destinationPartyList: Party) => {
    const isValid =
      (destinationPartyList.locationUuid &&
        operation?.destinationType === "Location" &&
        (destinationTags.length === 0 ||
          (destinationPartyList.tags &&
            destinationTags.some((x) =>
              destinationPartyList.tags.includes(x)
            )))) ||
      (destinationPartyList.stockSourceUuid &&
        operation?.destinationType === "Other");
    return isValid;
  };
  return (
    <div style={{ margin: "10px" }}>
      <form className={`${styles.formContainer} ${styles.verticalForm}`}>
        {isCompleteStatus ? (
          <>
            {model?.operationDate && (
              <TextInput
                id="operationDateLbl"
                value={formatForDatePicker(model.operationDate)}
                readOnly={true}
                labelText={t("operationDate", "Operation Date")}
              />
            )}
            {model?.operationNumber && (
              <TextInput
                id="operationNoLbl"
                value={model.operationNumber}
                readOnly={true}
                labelText={t("operationNumber", "Operation Number")}
              />
            )}
            {model?.atLocationName && (
              <TextInput
                id="sourceLbl"
                value={model.atLocationName}
                readOnly={true}
                labelText={t("source", "Source")}
              />
            )}
            {model?.destinationName && (
              <TextInput
                id="destinationLbl"
                value={model.destinationName}
                readOnly={true}
                labelText={t("destination", "Destination")}
              />
            )}
            {model?.responsiblePersonGivenName &&
              model?.responsiblePersonFamilyName && (
                <TextInput
                  id="responsiblePersonLbl"
                  value={`${model.responsiblePersonGivenName} ${model.responsiblePersonFamilyName}`}
                  readOnly={true}
                  labelText={t("responsiblePerson", "Responsible Person")}
                />
              )}
            {showReason && model?.reasonName && (
              <TextInput
                id="reasonLbl"
                value={model.reasonName}
                readOnly={true}
                labelText={t("reason", "Reason")}
              />
            )}
            {model?.remarks && (
              <TextInput
                id="remarksLbl"
                value={model.remarks}
                readOnly={true}
                labelText={t("remarks", "Remarks")}
              />
            )}
          </>
        ) : (
          <>
            {canEdit && (
              <Controller
                control={control}
                render={({ field: { onChange } }) => (
                  <DatePicker
                    datePickerType="single"
                    maxDate={formatForDatePicker(today())}
                    locale="en"
                    dateFormat={DATE_PICKER_CONTROL_FORMAT}
                    onChange={([newDate]) => {
                      onChange(newDate);
                    }}
                  >
                    <DatePickerInput
                      invalid={!!errors.operationDate}
                      invalidText={errors?.operationDate?.message}
                      id="operationDate"
                      name="operationDate"
                      placeholder={DATE_PICKER_FORMAT}
                      labelText={t("operationDate", "Operation Date")}
                      defaultValue={formatForDatePicker(model?.operationDate)}
                    />
                  </DatePicker>
                )}
                name="operationDate"
              />
            )}

            {!canEdit && (
              <>
                <TextInput
                  id="operationDateLbl"
                  value={formatForDatePicker(model?.operationDate)}
                  readOnly={true}
                  labelText="Operation Date"
                />
              </>
            )}

            {isEditing && model?.operationNumber && (
              <TextInput
                id="operationNoLbl"
                value={model?.operationNumber}
                readOnly={true}
                labelText={"Operation Number"}
              />
            )}

            {canEdit && (operation?.hasSource || model?.atLocationUuid) && (
              <PartySelector
                controllerName="sourceUuid"
                name="sourceUuid"
                control={control}
                partyUuid={model?.atLocationUuid}
                title={
                  operation?.hasDestination || model?.destinationUuid
                    ? t("from", "From")
                    : t("location", "Location")
                }
                placeholder={
                  operation.hasDestination || model?.destinationUuid
                    ? t("chooseASource", "Choose a source")
                    : t("chooseALocation", "Choose a location")
                }
                invalid={!!errors.sourceUuid}
                invalidText={errors.sourceUuid && errors?.sourceUuid?.message}
                parties={sourcePartyList?.filter(sourcePartyListFilter) || []}
                filterFunction={sourcePartyListFilter}
              />
            )}

            {!canEdit && isEditing && (
              <PartySelector
                controllerName="sourceUuid"
                name="sourceUuid"
                control={control}
                partyUuid={model?.atLocationUuid}
                title={
                  operation?.hasDestination || model?.destinationUuid
                    ? "From"
                    : "Location"
                }
                placeholder={
                  operation.hasDestination || model?.destinationUuid
                    ? t("chooseASource", "Choose a source")
                    : t("chooseALocation", "Choose a location")
                }
                invalid={!!errors.sourceUuid}
                invalidText={errors.sourceUuid && errors?.sourceUuid?.message}
                parties={sourcePartyList?.filter(sourcePartyListFilter) || []}
                filterFunction={sourcePartyListFilter}
              />
            )}
            {canEdit &&
              (operation?.hasDestination || model?.destinationUuid) && (
                <PartySelector
                  controllerName="destinationUuid"
                  name="destinationUuid"
                  control={control}
                  partyUuid={model?.destinationUuid}
                  title={
                    operation?.hasSource || model?.atLocationUuid
                      ? t("to", "To")
                      : t("location", "Location")
                  }
                  placeholder={
                    operation?.hasSource || model?.atLocationUuid
                      ? t("chooseADestination", "Choose a destination")
                      : "Location"
                  }
                  invalid={!!errors.destinationUuid}
                  invalidText={
                    errors.destinationUuid && errors?.destinationUuid?.message
                  }
                  parties={
                    destinationPartyList?.filter(destinationPartyListFilter) ||
                    []
                  }
                  filterFunction={destinationPartyListFilter}
                />
              )}

            {!canEdit && isEditing && (
              <PartySelector
                controllerName="destinationUuid"
                name="destinationUuid"
                control={control}
                partyUuid={model?.destinationUuid}
                title={
                  operation?.hasSource || model?.atLocationUuid
                    ? t("to", "To")
                    : t("location", "Location")
                }
                placeholder={
                  operation?.hasSource || model?.atLocationUuid
                    ? t("chooseADestination", "Choose a destination")
                    : "Location"
                }
                invalid={!!errors.destinationUuid}
                invalidText={
                  errors.destinationUuid && errors?.destinationUuid?.message
                }
                parties={
                  destinationPartyList?.filter(destinationPartyListFilter) || []
                }
                filterFunction={destinationPartyListFilter}
              />
            )}

            {canEdit && (
              <UsersSelector
                controllerName="responsiblePersonUuid"
                name="responsiblePersonUuid"
                control={control}
                userUuid={model?.responsiblePersonUuid}
                title={t("responsiblePerson", "Responsible Person")}
                placeholder={t("filter", "Filter ...")}
                invalid={!!errors.responsiblePersonUuid}
                invalidText={
                  errors.responsiblePersonUuid &&
                  errors?.responsiblePersonUuid?.message
                }
                onUserChanged={(user) => {
                  if (user?.uuid === otherUser.uuid) {
                    setIsOtherUser(true);
                  } else {
                    setIsOtherUser(false);
                  }
                }}
              />
            )}

            {isOtherUser && (
              <ControlledTextInput
                id="responsiblePersonOther"
                name="responsiblePersonOther"
                control={control}
                controllerName="responsiblePersonOther"
                maxLength={255}
                size={"md"}
                value={`${model?.responsiblePersonOther ?? ""}`}
                labelText={t("responsiblePerson", "Responsible Person")}
                placeholder={t("pleaseSpecify", "Please Specify")}
                invalid={!!errors.responsiblePersonOther}
                invalidText={
                  errors.responsiblePersonOther &&
                  errors?.responsiblePersonOther?.message
                }
              />
            )}

            {!canEdit && isEditing && (
              <UsersSelector
                controllerName="responsiblePersonUuid"
                name="responsiblePersonUuid"
                control={control}
                userUuid={model?.responsiblePersonUuid}
                title={t("responsiblePerson", "Responsible Person")}
                placeholder={t("filter", "Filter ...")}
                invalid={!!errors.responsiblePersonUuid}
                invalidText={
                  errors.responsiblePersonUuid &&
                  errors?.responsiblePersonUuid?.message
                }
                onUserChanged={(user) => {
                  if (user?.uuid === otherUser.uuid) {
                    setIsOtherUser(true);
                  } else {
                    setIsOtherUser(false);
                  }
                }}
              />
            )}

            {showReason && canEdit && (
              <StockOperationReasonSelector
                controllerName="reasonUuid"
                name="reasonUuid"
                control={control}
                reasonUuid={model?.reasonUuid}
                placeholder={t("chooseAReason", "Choose a reason")}
                title={t("reason", "Reason")}
                invalid={!!errors.reasonUuid}
                invalidText={errors.reasonUuid && errors?.reasonUuid?.message}
                onReasonChange={(reason) => {
                  setValue("reasonUuid", reason.uuid);
                }}
              />
            )}

            {showReason && !canEdit && (
              <TextInput
                id="reasonUuidLbl"
                value={model?.reasonName ?? ""}
                readOnly={true}
                labelText={"Reason:"}
              />
            )}

            <ControlledTextArea
              id="remarks"
              name="remarks"
              control={control}
              controllerName="remarks"
              maxLength={255}
              value={`${model?.remarks ?? ""}`}
              labelText={t("remarks", "Remarks")}
              invalid={!!errors.remarks}
              invalidText={errors.remarks && errors?.remarks?.message}
            />

            <div style={{ display: "flex", flexDirection: "row-reverse" }}>
              <Button
                name="save"
                type="button"
                className="submitButton"
                onClick={handleSubmit(handleSave)}
                kind="primary"
                renderIcon={ArrowRight}
              >
                {isSaving ? <InlineLoading /> : t("next", "Next")}
              </Button>
            </div>
          </>
        )}
      </form>
    </div>
  );
};

function mapIssueStockLocations(stockOperation) {
  /** Since we are using requisition information to issue stock,
      please note that the locations will be inverted: the destination listed on the requisition will become the issuing location.
  */
  const { sourceUuid, sourceName, destinationUuid, destinationName } =
    stockOperation;
  return {
    ...stockOperation,
    sourceUuid: destinationUuid,
    sourceName: destinationName,
    destinationUuid: sourceUuid,
    destinationName: sourceName,
  };
}

export default BaseOperationDetails;
