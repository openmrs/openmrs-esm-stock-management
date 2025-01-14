import React, { useCallback, useState } from 'react';
import styles from '../stock-operation-form.scss';
import { Stack } from '@carbon/react';
import { Button } from '@carbon/react';
import { StockOperationDTO } from '../../../core/api/types/stockOperation/StockOperationDTO';
import { StockOperationType } from '../../../core/api/types/stockOperation/StockOperationType';
import { useTranslation } from 'react-i18next';
import useOperationTypePermisions from '../hooks/useOperationTypePermisions';
import { useFormContext } from 'react-hook-form';
import { StockOperationItemDtoSchema } from '../../validation-schema';
import { Column } from '@carbon/react';
import { RadioButtonGroup } from '@carbon/react';
import { RadioButton } from '@carbon/react';
import { Departure, ListChecked, Save, SendFilled } from '@carbon/react/icons';
import { InlineLoading } from '@carbon/react';
import { addOrEditStockOperation, showActionDialogButton } from '../../stock-operation.utils';
import { createStockOperation, updateStockOperation } from '../../stock-operations.resource';
import { handleMutate } from '../../../utils';
import { restBaseUrl, showSnackbar } from '@openmrs/esm-framework';
import { extractErrorMessagesFromResponse } from '../../../constants';
import { otherUser } from '../../../core/utils/utils';

type StockOperationSubmissionFormStepProps = {
  onPrevious?: () => void;
  stockOperation?: StockOperationDTO;
  stockOperationType: StockOperationType;
};
const StockOperationSubmissionFormStep: React.FC<StockOperationSubmissionFormStepProps> = ({
  onPrevious,
  stockOperationType,
  stockOperation,
}) => {
  const { t } = useTranslation();
  const operationTypePermision = useOperationTypePermisions(stockOperationType);
  const form = useFormContext<StockOperationItemDtoSchema>();
  const [approvalRequired, setApprovalRequired] = useState<boolean | null>(stockOperation?.approvalRequired);
  const handleRadioButtonChange = (selectedItem: boolean) => {
    setApprovalRequired(selectedItem);
  };

  const handleSave = useCallback(async () => {
    let result: StockOperationDTO; // To store the result for returning
    await form.handleSubmit(async (formData) => {
      try {
        const payload = {
          ...formData,
          // Remove other uuid if responsible person is set to other
          responsiblePersonUuid:
            formData.responsiblePersonUuid === otherUser.uuid ? undefined : formData.responsiblePersonUuid,
        };
        const resp = await (stockOperation
          ? updateStockOperation(stockOperation, payload)
          : createStockOperation(payload));
        result = resp.data; // Store the response data
        handleMutate(`${restBaseUrl}/stockmanagement/stockoperation`);
        showSnackbar({
          isLowContrast: true,
          title: stockOperation
            ? t('editStockOperation', 'Edit stock operation')
            : t('addStockOperation', 'Add stock operation'),
          kind: 'success',
          subtitle: stockOperation
            ? t('stockOperationEdited', 'Stock operation edited successfully')
            : t('stockOperationAdded', 'Stock operation added successfully'),
        });
      } catch (error) {
        const errorMessages = extractErrorMessagesFromResponse(error);
        showSnackbar({
          subtitle: errorMessages.join(', '),
          title: t('errorSavingForm', 'Error on saving form'),
          kind: 'error',
          isLowContrast: true,
        });
      }
    })(); // Call handleSubmit to trigger validation and submission
    return result; // Return the result after handleSubmit completes
  }, [form, stockOperation, t]);

  const handleComplete = useCallback(async () => {
    // delete model?.dateCreated;
    //   // setIsSaving(true);
    //   // if (!isEditing) {
    //   //   delete model.status;
    //   //   await actions.onSave(model);
    //   //   setIsSaving(false);
    //   // }
    //   // model.status = 'COMPLETED';
    //   // actions.onComplete(model);
    //   // setIsSaving(false);
    const operation = await handleSave();
    alert(JSON.stringify(operation, null, 2));
    // showActionDialogButton('Complete', false, props?.model);
  }, [handleSave]);
  const handleSubmitForReview = useCallback(async () => {
    const operation = await handleSave();
  }, [handleSave]);
  const handleDispatch = useCallback(async () => {
    const operation = await handleSave();
  }, [handleSave]);

  return (
    <Stack gap={4} className={styles.grid}>
      <div className={styles.heading}>
        <h4>
          {operationTypePermision?.requiresDispatchAcknowledgement
            ? t('submitAndDispatch', 'Submit/Dispatch')
            : t('submitAndComplete', 'Submit/Complete')}
        </h4>
        <div className={styles.btnSet}>
          {typeof onPrevious === 'function' && (
            <Button kind="secondary" onClick={onPrevious}>
              Previous
            </Button>
          )}
        </div>
      </div>
      <Column>
        <pre>{JSON.stringify(form.formState.errors, null, 2)}</pre>
      </Column>
      <Column>
        <RadioButtonGroup
          name="rbgApprovelRequired"
          legendText={t('doesThisTransactionRequireApproval', 'Does the transaction require approval ?')}
          onChange={handleRadioButtonChange}
        >
          <RadioButton value={true} id="rbgApprovelRequired-true" labelText={t('yes', 'Yes')} />
          <RadioButton value={false} id="rbgApprovelRequired-false" labelText={t('no', 'No')} />
        </RadioButtonGroup>
      </Column>
      <Column>
        {approvalRequired != null && (
          <>
            {!operationTypePermision.requiresDispatchAcknowledgement && !approvalRequired && (
              <Button
                name="complete"
                type="button"
                style={{ margin: '4px' }}
                className="submitButton"
                kind="primary"
                onClick={handleComplete}
                renderIcon={ListChecked}
              >
                {t('complete', 'Complete')}
              </Button>
            )}
            {operationTypePermision.requiresDispatchAcknowledgement && !approvalRequired && (
              <Button
                name="dispatch"
                type="button"
                style={{ margin: '4px' }}
                className="submitButton"
                kind="primary"
                // onClick={async () => {
                //   // delete model?.dateCreated;
                //   // delete model?.status;
                //   // setIsSaving(true);
                //   // await actions.onSave(model).then(() => {
                //   //   model.status = 'DISPATCHED';
                //   //   actions.onDispatch(model);
                //   //   setIsSaving(false);
                //   // });
                // }}
                onClick={handleDispatch}
                renderIcon={Departure}
              >
                {form.formState.isSubmitting ? (
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
                // onClick={async () => {
                //   // delete model?.dateCreated;
                //   // delete model?.status;
                //   // setIsSaving(true);
                //   // await actions.onSave(model).then(() => {
                //   //   model.status = 'SUBMITTED';
                //   //   actions.onSubmit(model);
                //   //   setIsSaving(false);
                //   // });
                // }}
                onClick={handleSubmitForReview}
                renderIcon={SendFilled}
              >
                {form.formState.isSubmitting ? (
                  <InlineLoading description={t('submittingForReview', 'Submitting for review')} />
                ) : (
                  t('submitForReview', 'Submit For Review')
                )}
              </Button>
            )}
          </>
        )}
        <Button
          name="save"
          type="button"
          className="submitButton"
          style={{ margin: '4px' }}
          disabled={form.formState.isSubmitting}
          // onClick={async () => {
          //   // delete model?.dateCreated;
          //   // delete model?.status;
          //   // setIsSaving(true);
          //   // model.approvalRequired = approvalRequired ? true : false;
          //   // await actions.onSave(model);
          //   // setIsSaving(false);
          // }}
          kind="secondary"
          onClick={handleSave}
          renderIcon={Save}
        >
          {form.formState.isSubmitting ? <InlineLoading /> : t('save', 'Save')}
        </Button>
      </Column>
    </Stack>
  );
};

export default StockOperationSubmissionFormStep;
