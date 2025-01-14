import { AccordionSkeleton } from '@carbon/react';
import { CircleDash } from '@carbon/react/icons';
import { showSnackbar } from '@openmrs/esm-framework';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StockOperationLinkDTO } from '../../core/api/types/stockOperation/StockOperationLinkDTO';
import {
  operationFromString,
  OperationType,
  StockOperationType,
  StockOperationTypeCanBeRelatedToRequisition,
  StockOperationTypeIsStockIssue,
  StockOperationTypeRequiresDispatchAcknowledgement,
} from '../../core/api/types/stockOperation/StockOperationType';
import { closeOverlay } from '../../core/components/overlay/hook';
import { TabItem } from '../../core/components/tabs/types';
import { useStockOperationTypes } from '../../stock-lookups/stock-lookups.resource';
import { addOrEditStockOperation, showActionDialogButton } from '../stock-operation.utils';
import StockOperationApprovalButton from '../stock-operations-dialog/stock-operations-approve-button.component';
import StockOperationApproveDispatchButton from '../stock-operations-dialog/stock-operations-approve-dispatch-button.component';
import StockOperationCancelButton from '../stock-operations-dialog/stock-operations-cancel-button.component';
import StockOperationCompleteDispatchButton from '../stock-operations-dialog/stock-operations-completed-dispatch-button.component';
import StockOperationIssueStockButton from '../stock-operations-dialog/stock-operations-issue-stock-button.component';
import StockOperationPrintButton from '../stock-operations-dialog/stock-operations-print-button.component';
import StockOperationRejectButton from '../stock-operations-dialog/stock-operations-reject-button.component';
import StockOperationReturnButton from '../stock-operations-dialog/stock-operations-return-button.component';
import StockOperationStepper from '../stock-operations-forms/stock-operation-stepper/stock-operation-stepper.component';
import { getStockOperationLinks, operationStatusColor } from '../stock-operations.resource';
import { useInitializeStockOperations } from './add-stock-operation.resource';
import styles from './add-stock-operation.scss';
import BaseOperationDetails from './base-operation-details.component';
import ReceivedItems from './received-items.component';
import StockItemsAddition from './stock-items-addition.component';
import { StockOperation } from './stock-operation-context/useStockOperationContext';
import StockOperationRelatedLink from './stock-operation-related-link.component';
import StockOperationStatus from './stock-operation-status.component';
import StockOperationSubmission from './stock-operation-submission.component';
import { AddStockOperationProps } from './types';

const AddStockOperation: React.FC<AddStockOperationProps> = (props) => {
  const { t } = useTranslation();
  const { isEditing, canEdit, canPrint } = props;
  const { isLoading, error, result } = useInitializeStockOperations(props);
  const [operationLinks, setOperationLinks] = useState<StockOperationLinkDTO[]>();
  const [manageStockItems, setManageStockItems] = useState(props?.isEditing);
  const { types } = useStockOperationTypes();
  const [requisition, setRequisition] = useState(props?.model?.uuid);
  const [manageSubmitOrComplete, setManageSubmitOrComplete] = useState(props?.isEditing);

  const [requiresDispatchAcknowledgement, setRequiresDispatchAcknowledgement] = useState(false);

  const currentStockOperationType = types?.results?.find((p) => p.operationType === props?.model?.operationType);

  useEffect(() => {
    if (
      currentStockOperationType?.operationType === OperationType.REQUISITION_OPERATION_TYPE ||
      props?.model?.operationType === OperationType.REQUISITION_OPERATION_TYPE
    ) {
      setRequisition(props?.model?.uuid);
    }
  }, [currentStockOperationType, props?.model?.operationType, props?.model?.uuid]);

  useEffect(() => {
    if (
      isEditing ||
      StockOperationTypeCanBeRelatedToRequisition(operationFromString(currentStockOperationType?.name.toLowerCase())) ||
      OperationType.REQUISITION_OPERATION_TYPE === currentStockOperationType?.operationType
    ) {
      getStockOperationLinks(requisition).then((resp) => {
        setOperationLinks(resp.data?.results);
      });
    }
  }, [currentStockOperationType, requisition, props.model?.uuid, isEditing]);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canDisplayReceivedItems, setCanDisplayReceivedItems] = useState(false);

  useEffect(() => {
    const validOperationType = Object.values(OperationType).includes(props.model.operationType as OperationType)
      ? (props.model.operationType as OperationType)
      : OperationType.RETURN_OPERATION_TYPE;

    setRequiresDispatchAcknowledgement(StockOperationTypeRequiresDispatchAcknowledgement(validOperationType));
  }, [props.model.operationType]);

  useEffect(() => {
    setCanDisplayReceivedItems(props?.model?.permission?.canDisplayReceivedItems ?? false);
  }, [props?.model?.permission]);

  if (isLoading) return <AccordionSkeleton />;
  if (error) {
    closeOverlay();
    showSnackbar({
      kind: 'error',
      title: t('error', 'Error'),
      subtitle: t('errorLoadingStockOperation', 'Error loading stock item'),
      timeoutInMs: 5000,
      isLowContrast: true,
    });
    return;
  }

  let operations: StockOperationType[] | null | undefined;
  const status = props?.model?.status;

  const tabs: TabItem[] = [
    {
      name: isEditing ? `${props?.operation?.name} Details` : `${props?.operation?.name} Details`,
      component: (
        <BaseOperationDetails
          {...props}
          isEditing={props?.operation?.name === 'Stock Issue' ? !isEditing : isEditing}
          setup={result}
          canEdit={canEdit}
          model={isEditing ? props?.model : props?.operation?.name === 'Stock Issue' ? props?.model : result?.dto}
          onSave={async () => {
            setManageStockItems(true);
            setSelectedIndex(1);
          }}
          operation={props?.operation}
        />
      ),
    },
    {
      name: t('stockItems', 'Stock Items'),
      component: (
        <StockItemsAddition
          {...props}
          isEditing={isEditing}
          setup={result}
          canEdit={canEdit}
          model={isEditing ? props?.model : props?.operation?.name === 'Stock Issue' ? props?.model : result?.dto} // check if type is stockIssue and pass requisition data
          onSave={async () => {
            setManageSubmitOrComplete(true);
            setSelectedIndex(2);
          }}
        />
      ),
      disabled: !(isEditing || manageStockItems),
    },
    {
      name: result?.requiresDispatchAcknowledgement ? 'Submit/Dispatch' : 'pstockoperSubmit/Complete',
      component: (
        <StockOperationSubmission
          {...props}
          isEditing={isEditing}
          setup={result}
          canEdit={canEdit}
          locked={false}
          model={isEditing ? props?.model : props?.operation?.name === 'Stock Issue' ? props?.model : result?.dto}
          requiresDispatchAcknowledgement={
            isEditing
              ? props?.model?.operationType === 'return' || props?.model?.operationType === 'issuestock'
              : result.requiresDispatchAcknowledgement
          }
          actions={{
            onGoBack: () => {
              setSelectedIndex(1);
            },
            onSave: async (model) => {
              // TODO: Update
              await addOrEditStockOperation(t, model, props.isEditing, props.operation);
            },

            onComplete: async () => {
              await showActionDialogButton('Complete', false, props?.model);
            },
            onSubmit: async () => {
              await showActionDialogButton('Submit', false, props?.model);
            },
            onDispatch: async () => {
              await showActionDialogButton('Dispatch', false, props?.model);
            },
          }}
        />
      ),
      disabled: !(props.isEditing || manageSubmitOrComplete),
    },
  ].concat(
    StockOperationTypeIsStockIssue(props?.model?.operationType as OperationType) || canDisplayReceivedItems
      ? status === 'DISPATCHED' || status === 'COMPLETED'
        ? [
            {
              name: t('receivedItems', 'Received Items'),
              component: <ReceivedItems model={props?.model} />,
            },
          ]
        : []
      : [],
  );

  return (
    <>
      {!isEditing && props.operation.name === 'Stock Issue' ? (
        <></>
      ) : (
        <div className={styles.statusBody}>
          <div style={{ margin: '10px' }}>
            {isEditing && (
              <div className={styles.statusLabel}>
                <span className={styles.textHeading}>{t('status', 'Status ')}:</span>
                <span
                  style={{
                    marginLeft: '2px',
                    color: `${operationStatusColor(props?.model?.status)}`,
                  }}
                >
                  {props?.model?.status}
                </span>
              </div>
            )}
            <StockOperationStatus model={props?.model} />
          </div>

          {((!props?.model?.permission?.canEdit &&
            (props?.model?.permission?.canApprove || props?.model?.permission?.canReceiveItems)) ||
            props?.model?.permission?.canEdit ||
            canPrint ||
            props?.model?.permission?.isRequisitionAndCanIssueStock) && (
            <div
              style={{
                margin: '10px',
                display: 'flex',
                flexDirection: 'row',
              }}
            >
              <>
                {!props?.model?.permission?.canEdit && props?.model?.permission?.canApprove && (
                  <>
                    {!requiresDispatchAcknowledgement && (
                      <div style={{ margin: '2px' }}>
                        <StockOperationApprovalButton operation={props?.model} />
                      </div>
                    )}

                    {requiresDispatchAcknowledgement && (
                      <div style={{ margin: '2px' }}>
                        <StockOperationApproveDispatchButton operation={props?.model} />
                      </div>
                    )}

                    <div style={{ margin: '2px' }}>
                      <StockOperationRejectButton operation={props?.model} />
                    </div>
                    <div style={{ margin: '2px' }}>
                      <StockOperationReturnButton operation={props?.model} />
                    </div>
                    <div style={{ margin: '2px' }}>
                      <StockOperationCancelButton operation={props?.model} />
                    </div>
                  </>
                )}

                {!props?.model?.permission?.canEdit && props?.model?.permission?.canReceiveItems && (
                  <>
                    <div style={{ margin: '2px' }}>
                      <StockOperationCompleteDispatchButton operation={props?.model} reason={false} />
                    </div>
                    <div style={{ margin: '2px' }}>
                      <StockOperationReturnButton operation={props?.model} />
                    </div>
                  </>
                )}

                {props?.model?.permission?.canEdit && (
                  <div style={{ margin: '2px' }}>
                    <StockOperationCancelButton operation={props?.model} />
                  </div>
                )}

                {props?.model?.permission?.isRequisitionAndCanIssueStock && (
                  <div style={{ margin: '2px' }}>
                    <StockOperationIssueStockButton operation={props?.model} operations={operations} />
                  </div>
                )}
                {(props?.model?.permission?.isRequisitionAndCanIssueStock ||
                  props?.model?.operationType === OperationType.STOCK_ISSUE_OPERATION_TYPE ||
                  props?.model?.operationType === OperationType.REQUISITION_OPERATION_TYPE ||
                  props?.model?.operationType === OperationType.RECEIPT_OPERATION_TYPE ||
                  props?.model?.operationType === OperationType.TRANSFER_OUT_OPERATION_TYPE) && (
                  <div style={{ margin: '2px' }}>
                    <StockOperationPrintButton operation={props?.model} />
                  </div>
                )}
              </>
            </div>
          )}
        </div>
      )}
      {operationLinks && operationLinks?.length > 0 && (
        <div style={{ margin: '10px' }}>
          <h6 style={{ color: '#24a148' }}>Related Transactions:</h6>
          {operationLinks.map(
            (item) =>
              (props?.model?.uuid === item?.parentUuid || currentStockOperationType?.uuid === item?.parentUuid) && (
                <>
                  <span>{item?.childOperationTypeName}</span>
                  <span className={item?.childVoided ? 'voided' : ''}>
                    <span> </span>
                    {item?.childVoided && item?.childOperationNumber}
                    {!item?.childVoided && (
                      <span className={styles.relatedLink}>
                        <StockOperationRelatedLink
                          operationTypes={types.results}
                          operationUuid={item?.childUuid}
                          operationNumber={item?.childOperationNumber}
                        />
                      </span>
                    )}
                  </span>
                  <span> </span>
                  <span>[{item?.childStatus}]</span>
                </>
              ),
          )}
          <span> </span>
          {operationLinks.map(
            (item) =>
              (props.model?.uuid === item?.childUuid || currentStockOperationType.uuid === item?.childUuid) && (
                <>
                  <span>{item?.parentOperationTypeName}</span>
                  <span className={item?.parentVoided ? 'voided' : ''}>
                    <span> </span>
                    {item?.parentVoided && item?.parentOperationNumber}
                    {!item?.parentVoided && (
                      <span className={styles.relatedLink}>
                        <StockOperationRelatedLink
                          operationTypes={types.results}
                          operationUuid={item?.parentUuid}
                          operationNumber={item?.parentOperationNumber}
                        />
                      </span>
                    )}
                  </span>
                  <span> </span>
                  <span>[{item?.parentStatus}]</span>
                </>
              ),
          )}
        </div>
      )}

      <StockOperation>
        <StockOperationStepper
          steps={tabs.map((tab, index) => ({
            title: tab.name,
            component: tab.component,
            disabled: tab.disabled,
            subTitle: `Subtitle  for ${tab.name}`,
            icon: <CircleDash />,
          }))}
          selectedIndex={selectedIndex}
          onChange={setSelectedIndex}
        />
        {/* <VerticalTabs tabs={tabs} selectedIndex={selectedIndex} onChange={setSelectedIndex} /> */}
      </StockOperation>
    </>
  );
};

export default AddStockOperation;
