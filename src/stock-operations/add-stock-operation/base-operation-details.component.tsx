import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { StockOperationDTO } from "../../core/api/types/stockOperation/StockOperationDTO";
import { SaveStockOperation } from "../../stock-items/types";
import { StockOperationType } from "../../core/api/types/stockOperation/StockOperationType";
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
} from "@carbon/react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  StockOperationFormData,
  stockOperationSchema,
} from "../validation-schema";
import { Save } from "@carbon/react/icons";
import PartySelector from "../party-selector/party-selector.component";
import {
  LocationTypeLocation,
  LocationTypeOther,
} from "../../core/api/types/stockOperation/LocationType";
import UsersSelector from "../users-selector/users-selector.component";
import { otherUser, RECEIPT_OPERATION_TYPE } from "../utils";
import ControlledTextInput from "../../core/components/carbon/controlled-text-input/controlled-text-input.component";
import StockOperationReasonSelector from "../stock-operation-reason-selector/stock-operation-reason-selector.component";
import ControlledTextArea from "../../core/components/carbon/controlled-text-area/controlled-text-area.component";

interface BaseOperationDetailsProps {
  isEditing?: boolean;
  model?: StockOperationDTO;
  onSave?: SaveStockOperation;
  operation: StockOperationType;
}

const BaseOperationDetails: React.FC<BaseOperationDetailsProps> = ({
  model,
  onSave,
  operation,
}) => {
  const { t } = useTranslation();

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<StockOperationFormData>({
    defaultValues: model,
    mode: "all",
    resolver: zodResolver(stockOperationSchema),
  });

  const [isOtherUser, setIsOtherUser] = useState<boolean | null>();

  const sourceTags =
    operation?.stockOperationTypeLocationScopes
      ?.filter((p) => operation?.hasSource && p.isSource)
      .map((p) => p.locationTag) ?? [];

  const destinationTags =
    operation?.stockOperationTypeLocationScopes
      ?.filter((p) => operation?.hasDestination && p.isDestination)
      .map((p) => p.locationTag) ?? [];

  const [isSaving, setIsSaving] = useState(false);

  const showDestination = [RECEIPT_OPERATION_TYPE].includes(
    operation.operationType
  );

  const handleSave = async (item: StockOperationDTO) => {
    try {
      setIsSaving(true);

      // Restore uuid
      item.uuid = model.uuid;
      await onSave(item);
    } catch (e) {
      // Show notification
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form className={`formContainer verticalForm`}>
      <Controller
        control={control}
        render={({ field: { onChange } }) => (
          <DatePicker
            datePickerType="single"
            maxDate={formatForDatePicker(today())}
            locale="en"
            dateFormat={DATE_PICKER_CONTROL_FORMAT}
            onChange={onChange}
          >
            <DatePickerInput
              invalid={!!errors.operationDate}
              invalidText={errors?.operationDate?.message}
              id="operationDate"
              name="operationDate"
              placeholder={DATE_PICKER_FORMAT}
              labelText={t("operationDate", "Operation Date")}
              value={formatForDatePicker(model?.operationDate)}
            />
          </DatePicker>
        )}
        name="operationDate"
      />

      {/*<ControlledTextInput*/}
      {/*  controllerName="operationNumber"*/}
      {/*  name="operationNumber"*/}
      {/*  control={control as unknown as Control}*/}
      {/*  id="operationNumber"*/}
      {/*  labelText="Operation Number"*/}
      {/*  invalid={!!errors.operationNumber}*/}
      {/*  invalidText={errors?.operationNumber?.message}*/}
      {/*/>*/}

      <PartySelector
        controllerName="sourceUuid"
        name="sourceUuid"
        control={control}
        title={t("location:", "Location:")}
        placeholder={t("chooseALocation", "Choose a location")}
        invalid={!!errors.sourceUuid}
        invalidText={errors.sourceUuid && errors?.sourceUuid?.message}
        filter={(p) => {
          return (
            (p.locationUuid &&
              operation?.sourceType === LocationTypeLocation &&
              (sourceTags.length === 0 ||
                (p.tags && sourceTags.some((x) => p.tags.includes(x))))) ||
            (p.stockSourceUuid && operation?.sourceType === LocationTypeOther)
          );
        }}
      />

      {showDestination && (
        <PartySelector
          controllerName="destinationUuid"
          name="destinationUuid"
          control={control}
          title={operation?.hasSource ? "Destination:" : "Location:"}
          placeholder={t("chooseADestination", "Choose a destination")}
          invalid={!!errors.sourceUuid}
          invalidText={errors.sourceUuid && errors?.sourceUuid?.message}
          filter={(p) => {
            return (
              (p.locationUuid &&
                operation?.destinationType === LocationTypeLocation &&
                (destinationTags.length === 0 ||
                  (p.tags &&
                    destinationTags.some((x) => p.tags.includes(x))))) ||
              (p.stockSourceUuid &&
                operation?.destinationType === LocationTypeOther)
            );
          }}
        />
      )}

      <UsersSelector
        controllerName="responsiblePersonUuid"
        name="responsiblePersonUuid"
        control={control}
        title={t("responsiblePerson:", "Responsible Person:")}
        placeholder={t("filter", "Filter ...")}
        invalid={!!errors.sourceUuid}
        invalidText={errors.sourceUuid && errors?.sourceUuid?.message}
        onUserChanged={(user) => {
          if (user.uuid === otherUser.uuid) {
            setIsOtherUser(true);
          }
        }}
      />

      {isOtherUser && (
        <ControlledTextInput
          id="responsiblePersonOther"
          name="responsiblePersonOther"
          control={control}
          controllerName="responsiblePersonOther"
          maxLength={255}
          size={"md"}
          value={`${model?.responsiblePersonOther ?? ""}`}
          labelText={t("responsiblePerson", "Responsible Person:")}
          placeholder={t("pleaseSpecify", "Please Specify:")}
          invalid={!!errors.responsiblePersonOther}
          invalidText={
            errors.responsiblePersonOther &&
            errors?.responsiblePersonOther?.message
          }
        />
      )}

      <StockOperationReasonSelector
        controllerName="reasonUuid"
        name="reasonUuid"
        control={control}
        placeholder={t("chooseAReason", "Choose a reason")}
        title={t("reason", "Reason:")}
        invalid={!!errors.sourceUuid}
        invalidText={errors.sourceUuid && errors?.sourceUuid?.message}
      />

      <ControlledTextArea
        id="remarks"
        name="remarks"
        control={control}
        controllerName="remarks"
        maxLength={255}
        value={`${model?.remarks ?? ""}`}
        labelText={t("remarks:", "Remarks:")}
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
          renderIcon={Save}
        >
          {isSaving ? <InlineLoading /> : t("save", "Save")}
        </Button>
      </div>
    </form>
  );
};

export default BaseOperationDetails;
