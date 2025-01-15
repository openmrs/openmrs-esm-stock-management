import React, { useMemo } from 'react';
import { StockOperationDTO } from '../../core/api/types/stockOperation/StockOperationDTO';
import { OperationType, StockOperationType } from '../../core/api/types/stockOperation/StockOperationType';
import useOperationTypePermisions from './hooks/useOperationTypePermisions';
import useStockOperationLinks from './hooks/useStockOperationLinks';
import StockOperationRelatedLink from './stock-operation-related-link.component';
import styles from './stock-operation-form.scss';
import StockOperationStatus from '../add-stock-operation/stock-operation-status.component';
import { operationStatusColor } from '../stock-operations.resource';
import StockOperationApprovalButton from '../stock-operations-dialog/stock-operations-approve-button.component';
import StockOperationApproveDispatchButton from '../stock-operations-dialog/stock-operations-approve-dispatch-button.component';
import StockOperationRejectButton from '../stock-operations-dialog/stock-operations-reject-button.component';
import StockOperationReturnButton from '../stock-operations-dialog/stock-operations-return-button.component';
import StockOperationCancelButton from '../stock-operations-dialog/stock-operations-cancel-button.component';
import StockOperationCompleteDispatchButton from '../stock-operations-dialog/stock-operations-completed-dispatch-button.component';
import StockOperationIssueStockButton from '../stock-operations-dialog/stock-operations-issue-stock-button.component';
import StockOperationPrintButton from '../stock-operations-dialog/stock-operations-print-button.component';
import { useTranslation } from 'react-i18next';

type Props = {
  stockOperation: StockOperationDTO;
  stockOperationType: StockOperationType;
};

const StockOperationFormHeader: React.FC<Props> = ({ stockOperationType, stockOperation }) => {
  const operationTypePermision = useOperationTypePermisions(stockOperationType);
  //   TODO get stockoperation uuid if is of type requisition
  const requisitionOperationUuid = useMemo(() => null, []);
  const { error, isLoading, operationLinks } = useStockOperationLinks(requisitionOperationUuid);
  const { t } = useTranslation();
  if (isLoading || error) return null;

  return (
    <div>
      <div className={styles.statusBody}>
        <div style={{ margin: '10px' }}>
          <div className={styles.statusLabel}>
            <span className={styles.textHeading}>{t('status', 'Status ')}:</span>
            <span
              style={{
                marginLeft: '2px',
                color: `${operationStatusColor(stockOperation?.status)}`,
              }}
            >
              {stockOperation?.status}
            </span>
          </div>
          <StockOperationStatus model={stockOperation} />
        </div>

        {((!stockOperation.permission?.canEdit &&
          (stockOperation.permission?.canApprove || stockOperation.permission?.canReceiveItems)) ||
          stockOperation.permission?.canEdit ||
          //   TODO fOLLOW UP THE CAN PRINT LOGIC
          //   canPrint ||
          stockOperation.permission?.isRequisitionAndCanIssueStock) && (
          <div className={styles.actionBtns}>
            <>
              {!stockOperation.permission?.canEdit && stockOperation.permission?.canApprove && (
                <>
                  {!operationTypePermision.requiresDispatchAcknowledgement && (
                    <div style={{ margin: '2px' }}>
                      <StockOperationApprovalButton operation={stockOperation} />
                    </div>
                  )}

                  {operationTypePermision.requiresDispatchAcknowledgement && (
                    <div style={{ margin: '2px' }}>
                      <StockOperationApproveDispatchButton operation={stockOperation} />
                    </div>
                  )}

                  <div style={{ margin: '2px' }}>
                    <StockOperationRejectButton operation={stockOperation} />
                  </div>
                  <div style={{ margin: '2px' }}>
                    <StockOperationReturnButton operation={stockOperation} />
                  </div>
                  <div style={{ margin: '2px' }}>
                    <StockOperationCancelButton operation={stockOperation} />
                  </div>
                </>
              )}

              {!stockOperation.permission?.canEdit && stockOperation.permission?.canReceiveItems && (
                <>
                  <div style={{ margin: '2px' }}>
                    <StockOperationCompleteDispatchButton operation={stockOperation} reason={false} />
                  </div>
                  <div style={{ margin: '2px' }}>
                    <StockOperationReturnButton operation={stockOperation} />
                  </div>
                </>
              )}

              {stockOperation.permission?.canEdit && (
                <div style={{ margin: '2px' }}>
                  <StockOperationCancelButton operation={stockOperation} />
                </div>
              )}

              {stockOperation.permission?.isRequisitionAndCanIssueStock && (
                <div style={{ margin: '2px' }}>
                  <StockOperationIssueStockButton operation={stockOperation} />
                </div>
              )}
              {(stockOperation.permission?.isRequisitionAndCanIssueStock ||
                stockOperation.operationType === OperationType.STOCK_ISSUE_OPERATION_TYPE ||
                stockOperation.operationType === OperationType.REQUISITION_OPERATION_TYPE ||
                stockOperation.operationType === OperationType.RECEIPT_OPERATION_TYPE ||
                stockOperation.operationType === OperationType.TRANSFER_OUT_OPERATION_TYPE) && (
                <div style={{ margin: '2px' }}>
                  <StockOperationPrintButton operation={stockOperation} />
                </div>
              )}
            </>
          </div>
        )}
      </div>
      {operationLinks.length > 0 && (
        <div style={{ margin: '10px' }}>
          <h6 style={{ color: '#24a148' }}>Related Transactions:</h6>
          {operationLinks.map(
            (item) =>
              (stockOperation.uuid === item?.parentUuid || stockOperationType?.uuid === item?.parentUuid) && (
                <>
                  <span>{item?.childOperationTypeName}</span>
                  <span className={item?.childVoided ? 'voided' : ''}>
                    <span> </span>
                    {item?.childVoided && item?.childOperationNumber}
                    {!item?.childVoided && (
                      <span className={styles.relatedLink}>
                        <StockOperationRelatedLink
                          stockOperationUuid={item?.childUuid}
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
              (stockOperation.uuid === item?.childUuid || stockOperationType.uuid === item?.childUuid) && (
                <>
                  <span>{item?.parentOperationTypeName}</span>
                  <span className={item?.parentVoided ? 'voided' : ''}>
                    <span> </span>
                    {item?.parentVoided && item?.parentOperationNumber}
                    {!item?.parentVoided && (
                      <span className={styles.relatedLink}>
                        <StockOperationRelatedLink
                          stockOperationUuid={item?.parentUuid}
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
    </div>
  );
};

export default StockOperationFormHeader;
