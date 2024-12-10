import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StockOperationDTO } from '../../core/api/types/stockOperation/StockOperationDTO';
import { SaveStockOperation, SaveStockOperationAction } from '../../stock-items/types';
import { StockOperationType } from '../../core/api/types/stockOperation/StockOperationType';
import { InitializeResult } from './types';
import { Button, InlineLoading, RadioButton, RadioButtonGroup, TextInput } from '@carbon/react';
import { Departure, ListChecked, Save, SendFilled, Undo } from '@carbon/react/icons';
import { DrugIssuanceStatus } from '../stock-operation.utils';
import { showSnackbar } from '@openmrs/esm-framework';

interface StockOperationSubmissionProps {
  isEditing?: boolean;
  model?: StockOperationDTO;
  onSave?: SaveStockOperation;
  operation: StockOperationType;
  setup: InitializeResult;
  canEdit?: boolean;
  locked?: boolean;
  requiresDispatchAcknowledgement?: boolean;
  drugIssuanceStatus?: DrugIssuanceStatus[];
  actions: Partial<StockOperationActions>;
}

type StockOperationActions = {
  onGoBack: () => void;
  onSave?: SaveStockOperation;
  onComplete: SaveStockOperationAction;
  onSubmit: SaveStockOperationAction;
  onDispatch: SaveStockOperationAction;
};

const StockOperationSubmission: React.FC<StockOperationSubmissionProps> = ({
  canEdit,
  locked,
  model,
  requiresDispatchAcknowledgement,
  actions,
  isEditing,
  drugIssuanceStatus,
}) => {
  const { t } = useTranslation();
  const [isSaving, setIsSaving] = useState(false);
  const [approvalRequired, setApprovalRequired] = useState<boolean | null>(model?.approvalRequired);
  const handleRadioButtonChange = (selectedItem: boolean) => {
    setApprovalRequired(selectedItem);
  };

  const handleSaveAndIssue = async () => {
    try {
      setIsSaving(true);
      delete model?.dateCreated;
      delete model?.status;

      model.approvalRequired = approvalRequired ? true : false;

      if (requiresDispatchAcknowledgement) {
        const selectedItems = model.stockOperationItems.filter((item) =>
          drugIssuanceStatus?.find((status) => status.drugUuid === item.stockItemUuid && status.isIssued),
        );
        const unselectedItems = model.stockOperationItems.filter(
          (item) => !drugIssuanceStatus?.find((status) => status.drugUuid === item.stockItemUuid && status.isIssued),
        );

        if (selectedItems.length > 0) {
          const selectedOperation: StockOperationDTO = {
            ...model,
            stockOperationItems: selectedItems,
            status: 'DISPATCHED' as const,
          };
          await actions?.onSave?.(selectedOperation);
          await actions?.onDispatch?.(selectedOperation);
        }

        if (unselectedItems.length > 0) {
          const remainingOperation: StockOperationDTO = {
            ...model,
            stockOperationItems: unselectedItems,
            status: 'NEW' as const,
          };
          await actions?.onSave?.(remainingOperation);
        }
      } else {
        // Regular save logic
        await actions?.onSave?.(model);
      }
      showSnackbar({
        title: t('saveSuccess', 'Save Successful'),
        kind: 'success',
        subtitle: t('operationSaved', 'Operation saved successfully'),
      });
    } catch (error) {
      console.error('Error saving operation:', error);
      showSnackbar({
        title: t('saveError', 'Save Error'),
        kind: 'error',
        subtitle: t('errorSavingOperation', 'An error occurred while saving the operation'),
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ margin: '10px' }}>
      {canEdit && !locked && (
        <div style={{ margin: '10px' }}>
          <RadioButtonGroup
            name="rbgApprovelRequired"
            legendText={t('doesThisTransactionRequireApproval', 'Does the transaction require approval ?')}
            onChange={handleRadioButtonChange}
            defaultSelected={model?.approvalRequired === null ? false : approvalRequired}
          >
            <RadioButton value={true} id="rbgApprovelRequired-true" labelText={t('yes', 'Yes')} />
            <RadioButton value={false} id="rbgApprovelRequired-false" labelText={t('no', 'No')} />
          </RadioButtonGroup>
        </div>
      )}
      {!canEdit && (
        <>
          <TextInput
            style={{ margin: '5px' }}
            id="rbgApproveRequiredLbl"
            value={approvalRequired ? t('yes', 'Yes') : t('no', 'No')}
            readOnly={true}
            labelText={t('doesThisTransactionRequireApproval', 'Does the transaction require approval ?')}
          />
        </>
      )}

      {canEdit && !locked && (
        <div className="stkpg-form-buttons" style={{ margin: '10px' }}>
          {approvalRequired != null && (
            <>
              {!requiresDispatchAcknowledgement && !approvalRequired && (
                <Button
                  name="complete"
                  type="button"
                  style={{ margin: '4px' }}
                  className="submitButton"
                  kind="primary"
                  onClick={async () => {
                    delete model?.dateCreated;
                    setIsSaving(true);
                    if (!isEditing) {
                      delete model.status;
                      await actions?.onSave?.(model);
                    }
                    model.status = 'COMPLETED';
                    await actions.onComplete(model);
                    setIsSaving(false);
                  }}
                  renderIcon={ListChecked}
                >
                  {t('complete', 'Complete')}
                </Button>
              )}
              {requiresDispatchAcknowledgement && !approvalRequired && (
                <Button
                  name="dispatch"
                  type="button"
                  style={{ margin: '4px' }}
                  className="submitButton"
                  kind="primary"
                  onClick={handleSaveAndIssue}
                  renderIcon={Departure}
                >
                  {isSaving ? (
                    <InlineLoading description={t('dispatching', 'Dispatching')} />
                  ) : (
                    t('dispatch', 'Dispatch')
                  )}
                </Button>
              )}
              {approvalRequired && (
                <Button
                  name="submit"
                  type="button"
                  style={{ margin: '4px' }}
                  className="submitButton"
                  kind="primary"
                  onClick={async () => {
                    delete model?.dateCreated;
                    delete model?.status;
                    setIsSaving(true);
                    await actions.onSave(model);
                    model.status = 'SUBMITTED';
                    await actions.onSubmit(model);
                    setIsSaving(false);
                  }}
                  renderIcon={SendFilled}
                >
                  {isSaving ? (
                    <InlineLoading description={t('submittingForReview', 'Submitting for review')} />
                  ) : (
                    t('submitForReview', 'Submit For Review')
                  )}
                </Button>
              )}
            </>
          )}
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'row', margin: '10px' }}>
        <Button
          name="save"
          type="button"
          className="submitButton"
          style={{ margin: '4px' }}
          disabled={isSaving}
          onClick={handleSaveAndIssue}
          kind="primary"
          renderIcon={Save}
        >
          {isSaving ? (
            <InlineLoading
              description={requiresDispatchAcknowledgement ? t('issuing', 'Issuing...') : t('saving', 'Saving...')}
            />
          ) : requiresDispatchAcknowledgement ? (
            t('saveAndIssue', 'Save & Issue')
          ) : (
            t('save', 'Save')
          )}
        </Button>
        {!isSaving && (
          <Button
            type="button"
            style={{ margin: '4px' }}
            className="cancelButton"
            kind="tertiary"
            onClick={actions?.onGoBack}
            renderIcon={Undo}
          >
            {t('goBack', 'Go Back')}
          </Button>
        )}
      </div>
    </div>
  );
};

export default StockOperationSubmission;
