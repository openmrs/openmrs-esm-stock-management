import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { TabItem } from "../../core/components/tabs/types";
import VerticalTabs from "../../core/components/tabs/vertical-tabs.component";
import BaseOperationDetails from "./base-operation-details.component";
import StockItemsAddition from "./stock-items-addition.component";
import StockOperationSubmission from "./stock-operation-submission.component";
import { AddStockOperationProps } from "./types";
import { useInitializeStockOperations } from "./add-stock-operation.resource";
import { AccordionSkeleton } from "@carbon/react";
import { closeOverlay } from "../../core/components/overlay/hook";
import {
  addOrEditStockOperation,
  showActionDialogButton,
} from "../stock-operation.utils";
import StockOperationApprovalButton from "../stock-operations-dialog/stock-operations-approve-button.component";
import StockOperationRejectButton from "../stock-operations-dialog/stock-operations-reject-button.component";
import StockOperationReturnButton from "../stock-operations-dialog/stock-operations-return-button.component";
import StockOperationCancelButton from "../stock-operations-dialog/stock-operations-cancel-button.component";
import StockOperationPrintButton from "../stock-operations-dialog/stock-operations-print-button.component";
import StockOperationApproveDispatchButton from "../stock-operations-dialog/stock-operations-approve-dispatch-button.component";
import StockOperationCompleteDispatchButton from "../stock-operations-dialog/stock-operations-completed-dispatch-button.component";
import StockOperationIssueStockButton from "../stock-operations-dialog/stock-operations-issue-stock-button.component";
import { StockOperation } from "./stock-operation-context/useStockOperationContext";
import { formatDate, parseDate, showSnackbar } from "@openmrs/esm-framework";
import {
  OperationType,
  StockOperationType,
  StockOperationTypeCanBeRelatedToRequisition,
  operationFromString,
} from "../../core/api/types/stockOperation/StockOperationType";
import {
  getStockOperationLinks,
  operationStatusColor,
} from "../stock-operations.resource";
import styles from "./add-stock-operation.scss";
import { useStockOperationTypes } from "../../stock-lookups/stock-lookups.resource";
import { StockOperationLinkDTO } from "../../core/api/types/stockOperation/StockOperationLinkDTO";

const AddStockOperation: React.FC<AddStockOperationProps> = (props) => {
  const { t } = useTranslation();
  const { isEditing, canEdit, canPrint } = props;
  const { isLoading, isError, result } = useInitializeStockOperations(props);
  const [operationLinks, setOperationLinks] =
    useState<StockOperationLinkDTO[]>();
  const [manageStockItems, setManageStockItems] = useState(props?.isEditing);
  const { types } = useStockOperationTypes();
  const [requisition, setRequisition] = useState(props?.model?.uuid);
  const [manageSubmitOrComplete, setManageSubmitOrComplete] = useState(
    props?.isEditing
  );

  const currentStockOperationType = types?.results?.find(
    (p) => p.operationType === props.model?.operationType
  );

  useEffect(() => {
    if (
      currentStockOperationType?.operationType ===
        OperationType.REQUISITION_OPERATION_TYPE ||
      props.model?.operationType === OperationType.REQUISITION_OPERATION_TYPE
    ) {
      setRequisition(props.model?.uuid);
    }
  }, [currentStockOperationType, props.model?.operationType]);

  useEffect(() => {
    if (
      isEditing ||
      StockOperationTypeCanBeRelatedToRequisition(
        operationFromString(currentStockOperationType?.name.toLowerCase())
      ) ||
      OperationType.REQUISITION_OPERATION_TYPE ===
        currentStockOperationType?.operationType
    ) {
      getStockOperationLinks(requisition).then((resp) => {
        setOperationLinks(resp.data?.results);
      });
    }
  }, [currentStockOperationType, requisition, props.model?.uuid]);

  const [selectedIndex, setSelectedIndex] = useState(0);

  if (isLoading) return <AccordionSkeleton />;
  if (isError) {
    closeOverlay();
    showSnackbar({
      kind: "error",
      title: t("error", "Error"),
      subtitle: t("errorLoadingStockOperation", "Error loading stock item"),
      timeoutInMs: 5000,
      isLowContrast: true,
    });
    return;
  }

  let operations: StockOperationType[] | null | undefined;
  const tabs: TabItem[] = [
    {
      name: isEditing
        ? `${props?.model?.operationTypeName} Details`
        : `${props?.operation?.name} Details`,
      component: (
        <BaseOperationDetails
          {...props}
          isEditing={
            props?.operation?.name === "Stock Issue" ? !isEditing : isEditing
          }
          setup={result}
          canEdit={
            props?.operation?.name === "Stock Issue" ? !canEdit : canEdit
          }
          model={
            isEditing
              ? props?.model
              : props?.operation?.name === "Stock Issue"
              ? props?.model
              : result?.dto
          } // check if type is stockIssue and pass requistion data
          onSave={async () => {
            setManageStockItems(true);
            setSelectedIndex(1);
          }}
          operation={props?.operation}
        />
      ),
    },
    {
      name: t("stockItems", "Stock Items"),
      component: (
        <StockItemsAddition
          {...props}
          isEditing={isEditing}
          setup={result}
          canEdit={canEdit}
          model={
            isEditing
              ? props?.model
              : props?.operation?.name === "Stock Issue"
              ? props?.model
              : result?.dto
          } // check if type is stockIssue and pass requistion data
          onSave={async () => {
            setManageSubmitOrComplete(true);
            setSelectedIndex(2);
          }}
        />
      ),
      disabled: !(isEditing || manageStockItems),
    },
    {
      name: result?.requiresDispatchAcknowledgement
        ? "Submit/Dispatch"
        : "Submit/Complete",
      component: (
        <StockOperationSubmission
          {...props}
          isEditing={isEditing}
          setup={result}
          canEdit={canEdit}
          locked={false}
          model={
            isEditing
              ? props?.model
              : props?.operation?.name === "Stock Issue"
              ? props?.model
              : result?.dto
          }
          requiresDispatchAcknowledgement={
            isEditing
              ? props?.model?.operationType === "return" ||
                props?.model?.operationType === "issuestock"
              : result.requiresDispatchAcknowledgement
          }
          actions={{
            onGoBack: () => {
              setSelectedIndex(1);
            },
            onSave: async (model) => {
              // TODO: Update
              await addOrEditStockOperation(
                t,
                model,
                props.isEditing,
                props.operation,
                props.operations,
                props.canPrint
              );
            },

            onComplete: async () => {
              await showActionDialogButton("Complete", false, props?.model);
            },
            onSubmit: async () => {
              await showActionDialogButton("Submit", false, props?.model);
            },
            onDispatch: async () => {
              await showActionDialogButton("Dispatch", false, props?.model);
            },
          }}
        />
      ),
      disabled: !(props.isEditing || manageSubmitOrComplete),
    },
  ];

  return (
    <>
      {!isEditing && props.operation.name === "Stock Issue" ? (
        <></>
      ) : (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            margin: "5px",
          }}
        >
          <div style={{ margin: "10px" }}>
            {isEditing && (
              <div style={{ display: "flex", flexDirection: "row" }}>
                <span className={styles.textHeading}>
                  {t("status", "Status ")}:
                </span>
                <span
                  style={{
                    marginLeft: "2px",
                    color: `${operationStatusColor(props?.model?.status)}`,
                  }}
                >
                  {props?.model?.status}
                </span>
              </div>
            )}
            <div className={styles.statusContainer}>
              {props?.model?.dateCreated && (
                <div>
                  <span className={styles.textHeading}>
                    {t("started", "Started")}:
                  </span>
                  <div className={styles.statusDescriptions}>
                    <span className={styles.text}>
                      {formatDate(
                        parseDate(props?.model?.dateCreated.toString()),
                        {
                          time: true,
                          mode: "standard",
                        }
                      )}
                    </span>

                    <span className={styles.text}>By</span>

                    <span className={styles.text}>
                      {props?.model?.creatorFamilyName} &nbsp;
                      {props?.model?.creatorGivenName}
                    </span>
                  </div>
                </div>
              )}

              {props?.model?.submittedDate && (
                <div>
                  <span className={styles.textHeading}>
                    {t("submitted", "Submitted")}:
                  </span>
                  <div className={styles.statusDescriptions}>
                    <span className={styles.text}>
                      {formatDate(
                        parseDate(props?.model?.submittedDate.toString()),
                        {
                          time: true,
                          mode: "standard",
                        }
                      )}
                    </span>

                    <span className={styles.text}>By</span>

                    <span className={styles.text}>
                      {props?.model?.submittedByFamilyName} &nbsp;
                      {props?.model?.submittedByGivenName}
                    </span>
                  </div>
                </div>
              )}

              {props?.model?.dispatchedDate && (
                <div>
                  <span className={styles.textHeading}>
                    {t("dispatched", "Dispatched")}:
                  </span>
                  <div className={styles.statusDescriptions}>
                    <span className={styles.text}>
                      {formatDate(
                        parseDate(props?.model?.dispatchedDate.toString()),
                        {
                          time: true,
                          mode: "standard",
                        }
                      )}
                    </span>

                    <span className={styles.text}>By</span>

                    <span className={styles.text}>
                      {props?.model?.dispatchedByFamilyName} &nbsp;
                      {props?.model?.dispatchedByGivenName}
                    </span>
                  </div>
                </div>
              )}

              {props?.model?.returnedDate && (
                <div>
                  <span className={styles.textHeading}>
                    {t("returned", "Returned")}:
                  </span>
                  <div className={styles.statusDescriptions}>
                    <span className={styles.text}>
                      {formatDate(
                        parseDate(props?.model?.returnedDate.toString()),
                        {
                          time: true,
                          mode: "standard",
                        }
                      )}
                    </span>

                    <span className={styles.text}>By</span>

                    <span className={styles.text}>
                      {props?.model?.returnedByFamilyName} &nbsp;
                      {props?.model?.returnedByGivenName}
                    </span>
                    <span className={styles.text}>
                      {props?.model?.returnReason}
                    </span>
                  </div>
                </div>
              )}

              {props?.model?.completedDate && (
                <div>
                  <span className={styles.textHeading}>
                    {t("completed", "Completed")}:
                  </span>
                  <div className={styles.statusDescriptions}>
                    <span className={styles.text}>
                      {formatDate(
                        parseDate(props?.model?.completedDate.toString()),
                        {
                          time: true,
                          mode: "standard",
                        }
                      )}
                    </span>

                    <span className={styles.text}>By</span>

                    <span className={styles.text}>
                      {props?.model?.completedByFamilyName} &nbsp;
                      {props?.model?.completedByGivenName}
                    </span>
                  </div>
                </div>
              )}

              {props?.model?.status === "CANCELLED" && (
                <div>
                  <span className={styles.textHeading}>
                    {t("cancelled", "Cancelled")}:
                  </span>
                  <div className={styles.statusDescriptions}>
                    <span className={styles.text}>
                      {formatDate(
                        parseDate(props?.model?.cancelledDate.toString()),
                        {
                          time: true,
                          mode: "standard",
                        }
                      )}
                    </span>

                    <span className={styles.text}>By</span>

                    <span className={styles.text}>
                      {props?.model?.cancelledByFamilyName} &nbsp;
                      {props?.model?.cancelledByGivenName}
                      <span className={styles.text}>
                        {props?.model?.cancelReason}
                      </span>
                    </span>
                  </div>
                </div>
              )}

              {props?.model?.status === "REJECTED" && (
                <div>
                  <span className={styles.textHeading}>
                    {t("rejected", "Rejected")}:
                  </span>
                  <div className={styles.statusDescriptions}>
                    <span className={styles.text}>
                      {formatDate(
                        parseDate(props?.model?.rejectedDate.toString()),
                        {
                          time: true,
                          mode: "standard",
                        }
                      )}
                    </span>

                    <span className={styles.text}>By</span>

                    <span className={styles.text}>
                      {props?.model?.rejectedByFamilyName} &nbsp;
                      {props?.model?.rejectedByGivenName}
                      <span>{props?.model?.rejectionReason}</span>
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {((!props?.model?.permission?.canEdit &&
            (props?.model?.permission?.canApprove ||
              props?.model?.permission?.canReceiveItems)) ||
            props?.model?.permission?.canEdit ||
            canPrint ||
            props?.model?.permission?.isRequisitionAndCanIssueStock) && (
            <div
              style={{
                margin: "10px",
                display: "flex",
                flexDirection: "row",
              }}
            >
              <>
                {!props?.model?.permission?.canEdit &&
                  props?.model?.permission?.canApprove && (
                    <>
                      {(props?.model
                        ? props?.model?.operationTypeName ===
                            OperationType.RETURN_OPERATION_TYPE ||
                          props?.model?.operationTypeName ===
                            OperationType.STOCK_ISSUE_OPERATION_TYPE
                        : true) && (
                        <div style={{ margin: "2px" }}>
                          <StockOperationApprovalButton
                            operation={props?.model}
                          />
                        </div>
                      )}
                      {!(props?.model
                        ? props?.model?.operationTypeName ===
                            OperationType.RETURN_OPERATION_TYPE ||
                          props?.model?.operationTypeName ===
                            OperationType.STOCK_ISSUE_OPERATION_TYPE
                        : true) && (
                        <div style={{ margin: "2px" }}>
                          <StockOperationApproveDispatchButton
                            operation={props?.model}
                          />
                        </div>
                      )}

                      <div style={{ margin: "2px" }}>
                        <StockOperationRejectButton operation={props?.model} />
                      </div>
                      <div style={{ margin: "2px" }}>
                        <StockOperationReturnButton operation={props?.model} />
                      </div>
                      <div style={{ margin: "2px" }}>
                        <StockOperationCancelButton operation={props?.model} />
                      </div>
                    </>
                  )}

                {!props?.model?.permission?.canEdit &&
                  props?.model?.permission?.canReceiveItems && (
                    <>
                      <div style={{ margin: "2px" }}>
                        <StockOperationCompleteDispatchButton
                          operation={props?.model}
                          reason={false}
                        />
                      </div>
                      <div style={{ margin: "2px" }}>
                        <StockOperationReturnButton operation={props?.model} />
                      </div>
                    </>
                  )}

                {props?.model?.permission?.canEdit && (
                  <div style={{ margin: "2px" }}>
                    <StockOperationCancelButton operation={props?.model} />
                  </div>
                )}

                {props?.model?.permission?.isRequisitionAndCanIssueStock && (
                  <div style={{ margin: "2px" }}>
                    <StockOperationIssueStockButton
                      operation={props?.model}
                      operations={operations}
                    />
                  </div>
                )}
                {(props?.model?.permission?.isRequisitionAndCanIssueStock ||
                  props?.model?.operationType ===
                    OperationType.STOCK_ISSUE_OPERATION_TYPE ||
                  props?.model?.operationType ===
                    OperationType.REQUISITION_OPERATION_TYPE ||
                  props?.model?.operationType ===
                    OperationType.RECEIPT_OPERATION_TYPE ||
                  props?.model?.operationType ===
                    OperationType.TRANSFER_OUT_OPERATION_TYPE) && (
                  <div style={{ margin: "2px" }}>
                    <StockOperationPrintButton operation={props?.model} />
                  </div>
                )}
              </>
            </div>
          )}
        </div>
      )}
      {operationLinks && operationLinks?.length > 0 && (
        <div style={{ margin: "10px" }}>
          <h6 style={{ color: "#24a148" }}>Related Transactions:</h6>
          {operationLinks.map(
            (item) =>
              (props.model?.uuid === item?.parentUuid ||
                currentStockOperationType.uuid === item?.parentUuid) && (
                <>
                  <span>{item?.childOperationTypeName}</span>
                  <span className={item?.childVoided ? "voided" : ""}>
                    <span> </span>
                    {item?.childVoided && item?.childOperationNumber}
                    {!item?.childVoided && (
                      <span
                        style={{
                          marginLeft: "2px",
                          color: "#0f62fe",
                        }}
                      >
                        {item?.childOperationNumber}
                      </span>
                    )}
                  </span>
                  <span> </span>
                  <span>[{item?.childStatus}]</span>
                </>
              )
          )}
          <span> </span>
          {operationLinks.map(
            (item) =>
              (props.model?.uuid === item?.childUuid ||
                currentStockOperationType.uuid === item?.childUuid) && (
                <>
                  <span>{item?.parentOperationTypeName}</span>
                  <span className={item?.parentVoided ? "voided" : ""}>
                    <span> </span>
                    {item?.parentVoided && item?.parentOperationNumber}
                    {!item?.parentVoided && (
                      <span
                        style={{
                          marginLeft: "2px",
                          color: "#0f62fe",
                        }}
                      >
                        {item?.parentOperationNumber}
                      </span>
                    )}
                  </span>
                  <span> </span>
                  <span>[{item?.parentStatus}]</span>
                </>
              )
          )}
        </div>
      )}

      <StockOperation>
        <VerticalTabs
          tabs={tabs}
          selectedIndex={selectedIndex}
          onChange={setSelectedIndex}
        />
      </StockOperation>
    </>
  );
};

export default AddStockOperation;
