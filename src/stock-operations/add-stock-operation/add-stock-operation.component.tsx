import React, { useState } from "react";
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
import { showToast } from "@openmrs/esm-framework";

const AddStockOperation: React.FC<AddStockOperationProps> = (props) => {
  const { t } = useTranslation();
  const { isEditing, canEdit, canPrint } = props;
  const { isLoading, isError, result } = useInitializeStockOperations(props);
  const [manageStockItems, setManageStockItems] = useState(props?.isEditing);
  const [manageSubmitOrComplete, setManageSubmitOrComplete] = useState(
    props.isEditing
  );
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [requiresDispatchAcknowledgement, setRequiresDispatchAcknowledgement] =
    useState(false);

  if (isLoading) return <AccordionSkeleton />;
  if (isError) {
    closeOverlay();
    showToast({
      kind: "error",
      title: t("error", "Error"),
      description: t("errorLoadingStockOperation", "Error loading stock item"),
      millis: 5000,
      critical: true,
    });
    return;
  }

  const tabs: TabItem[] = [
    {
      name: isEditing
        ? `${props.model.operationTypeName} Details`
        : `${props.operation.name} Details`,
      component: (
        <BaseOperationDetails
          {...props}
          isEditing={isEditing}
          setup={result}
          canEdit={canEdit}
          model={isEditing ? props?.model : result.dto}
          onSave={async () => {
            setManageStockItems(true);
            setSelectedIndex(1);
          }}
          operation={props.operation}
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
          model={isEditing ? props?.model : result.dto}
          onSave={async () => {
            setManageSubmitOrComplete(true);
            setSelectedIndex(2);
          }}
        />
      ),
      disabled: !(isEditing || manageStockItems),
    },
    {
      name: result.requiresDispatchAcknowledgement
        ? "Submit/Dispatch"
        : "Submit/Complete",
      component: (
        <StockOperationSubmission
          {...props}
          isEditing={isEditing}
          setup={result}
          canEdit={canEdit}
          locked={false}
          model={isEditing ? props?.model : result.dto}
          requiresDispatchAcknowledgement={false}
          actions={{
            onSave: async (model) => {
              // TODO: Update
              await addOrEditStockOperation(
                model,
                props.isEditing,
                props.operation,
                props.operations,
                props.canPrint
              );
            },
            onGoBack: () => {
              setSelectedIndex(1);
            },
            onComplete: async () => {
              await showActionDialogButton("Complete", false, props?.model);
            },
            onSubmit: async () => {
              await showActionDialogButton("Submit", false, props?.model);
            },
            onDispatch: async () => {
              await showActionDialogButton(
                "Dispatch Approval",
                false,
                props?.model
              );
            },
          }}
        />
      ),
      disabled: !(props.isEditing || manageSubmitOrComplete),
    },
  ];

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          margin: "5px",
        }}
      >
        <div style={{ margin: "10px" }}>
          <div style={{ display: "flex", flexDirection: "row" }}>
            <span style={{ margin: "4px" }}>Status :</span>
            <span style={{ margin: "4px" }}>{props.model.status}</span>
          </div>

          <div style={{ display: "flex", flexDirection: "row" }}>
            {props.model.status === "NEW" && (
              <div style={{ margin: "4px" }}>
                <span>Started : </span>
                <span>By </span>
                <span>
                  {props.model.creatorFamilyName} {""}
                  {props.model.creatorGivenName}
                </span>
              </div>
            )}
            {props.model.status === "SUBMITTED" && (
              <div style={{ margin: "4px" }}>
                <span>Submitted : </span>
                <span>By </span>
                <span>
                  {props.model.submittedByFamilyName} {""}
                  {props.model.submittedByGivenName}
                </span>
              </div>
            )}
            {props.model.status === "COMPLETED" && (
              <div style={{ margin: "4px" }}>
                <span>Completed : </span>
                <span>By </span>
                <span>
                  {props.model.completedByFamilyName} {""}
                  {props.model.completedByGivenName}
                </span>
              </div>
            )}
          </div>
        </div>

        {((!props.model?.permission?.canEdit &&
          (props.model?.permission?.canApprove ||
            props.model?.permission?.canReceiveItems)) ||
          props.model?.permission?.canEdit ||
          canPrint ||
          props.model?.permission?.isRequisitionAndCanIssueStock) && (
          <div
            style={{
              margin: "10px",
              display: "flex",
              flexDirection: "row",
            }}
          >
            <>
              {!props.model?.permission?.canEdit &&
                props.model?.permission?.canApprove && (
                  <>
                    {!requiresDispatchAcknowledgement && (
                      <div style={{ margin: "2px" }}>
                        <StockOperationApprovalButton operation={props.model} />
                      </div>
                    )}
                    {requiresDispatchAcknowledgement && (
                      <div style={{ margin: "2px" }}>
                        <StockOperationApproveDispatchButton
                          operation={props.model}
                        />
                      </div>
                    )}

                    <div style={{ margin: "2px" }}>
                      <StockOperationRejectButton operation={props.model} />
                    </div>
                    <div style={{ margin: "2px" }}>
                      <StockOperationReturnButton operation={props.model} />
                    </div>
                    <div style={{ margin: "2px" }}>
                      <StockOperationCancelButton operation={props.model} />
                    </div>
                  </>
                )}

              {!props.model?.permission?.canEdit &&
                props.model?.permission?.canReceiveItems && (
                  <>
                    <div style={{ margin: "2px" }}>
                      <StockOperationCompleteDispatchButton
                        operation={props.model}
                      />
                    </div>
                    <div style={{ margin: "2px" }}>
                      <StockOperationReturnButton operation={props.model} />
                    </div>
                  </>
                )}

              {props.model?.permission?.canEdit && (
                <div style={{ margin: "2px" }}>
                  <StockOperationCancelButton operation={props.model} />
                </div>
              )}

              {props.model?.permission?.isRequisitionAndCanIssueStock && (
                <div style={{ margin: "2px" }}>
                  <StockOperationIssueStockButton operation={props.model} />
                </div>
              )}
              {(props.model?.permission?.isRequisitionAndCanIssueStock ||
                props.model?.operationType === "stockissue" ||
                props.model?.operationType === "requisition" ||
                props.model?.operationType === "receipt" ||
                props.model?.operationType === "transferout") && (
                <div style={{ margin: "2px" }}>
                  <StockOperationPrintButton operation={props.model} />
                </div>
              )}
            </>
          </div>
        )}
      </div>
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
