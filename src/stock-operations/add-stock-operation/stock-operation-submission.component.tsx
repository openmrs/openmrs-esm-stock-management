import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { StockOperationDTO } from "../../core/api/types/stockOperation/StockOperationDTO";
import { SaveStockOperation } from "../../stock-items/types";
import { StockOperationType } from "../../core/api/types/stockOperation/StockOperationType";
import { InitializeResult } from "./types";
import {
  Button,
  InlineLoading,
  RadioButton,
  RadioButtonGroup,
  TextInput,
} from "@carbon/react";
import {
  Departure,
  ListChecked,
  Save,
  SendFilled,
  Undo,
} from "@carbon/react/icons";

interface StockOperationSubmissionProps {
  isEditing?: boolean;
  model?: StockOperationDTO;
  onSave?: SaveStockOperation;
  operation: StockOperationType;
  setup: InitializeResult;
  canEdit?: boolean;
  locked?: boolean;
  requiresDispatchAcknowledgement?: boolean;
  actions: {
    onGoBack: () => void;
    onSave?: SaveStockOperation;
    onComplete: () => void;
    onSubmit: () => void;
    onDispatch: () => void;
  };
}

const StockOperationSubmission: React.FC<StockOperationSubmissionProps> = ({
  canEdit = true,
  locked = false,
  model,
  requiresDispatchAcknowledgement,
  actions,
}) => {
  const { t } = useTranslation();
  const [isSaving, setIsSaving] = useState(false);

  return (
    <div style={{ margin: "10px" }}>
      {canEdit && !locked && (
        <div style={{ margin: "10px" }}>
          <RadioButtonGroup
            name="rbgApprovelRequired"
            legendText={t(
              "doesThisTransactionRequireApproval",
              "Does the transaction require approval?"
            )}
            onChange={(selectedItem: boolean) => {
              model.approvalRequired = selectedItem;
            }}
            defaultSelected={model.approvalRequired}
          >
            <RadioButton
              value={true}
              id="rbgApprovelRequired-true"
              labelText={t("yes", "Yes")}
            />
            <RadioButton
              value={false}
              id="rbgApprovelRequired-false"
              labelText={t("no", "No")}
            />
          </RadioButtonGroup>
        </div>
      )}
      {!canEdit && (
        <>
          <TextInput
            style={{ margin: "5px" }}
            id="rbgApproveRequiredLbl"
            value={model.approvalRequired ? t("yes", "Yes") : t("no", "No")}
            readOnly={true}
            labelText={t(
              "doesThisTransactionRequireApproval",
              "Does the transaction require approval?"
            )}
          />
        </>
      )}

      {canEdit && !locked && (
        <div className="stkpg-form-buttons" style={{ margin: "10px" }}>
          {model.approvalRequired != null && (
            <>
              {!requiresDispatchAcknowledgement && !model.approvalRequired && (
                <Button
                  name="complete"
                  type="button"
                  className="submitButton"
                  kind="primary"
                  onClick={actions.onComplete}
                  renderIcon={ListChecked}
                >
                  {t("complete", "Complete")}
                </Button>
              )}
              {requiresDispatchAcknowledgement && !model.approvalRequired && (
                <Button
                  name="dispatch"
                  type="button"
                  className="submitButton"
                  kind="primary"
                  onClick={actions.onDispatch}
                  renderIcon={Departure}
                >
                  {t("dispatch", "Dispatch")}
                </Button>
              )}
              {model.approvalRequired && (
                <Button
                  name="submit"
                  type="button"
                  className="submitButton"
                  kind="primary"
                  onClick={actions.onSubmit}
                  renderIcon={SendFilled}
                >
                  {t("submit", "Submit")}
                </Button>
              )}
            </>
          )}
          <Button
            name="save"
            type="button"
            className="submitButton"
            disabled={isSaving}
            onClick={async () => {
              setIsSaving(true);
              await actions.onSave(model);
              setIsSaving(false);
            }}
            kind="secondary"
            renderIcon={Save}
          >
            {isSaving ? <InlineLoading /> : t("save", "Save")}
          </Button>
          {!isSaving && (
            <Button
              type="button"
              className="cancelButton"
              kind="tertiary"
              onClick={actions.onGoBack}
              renderIcon={Undo}
            >
              {t("goBack", "Go Back")}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default StockOperationSubmission;
