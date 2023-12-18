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
import { addOrEditStockOperation } from "../stock-operation.utils";
import StockOperationApprovalButton from "../stock-operations-dialog/stock-operations-approve-button.component";
import StockOperationRejectButton from "../stock-operations-dialog/stock-operations-reject-button.component";
import StockOperationReturnButton from "../stock-operations-dialog/stock-operations-return-button.component";
import StockOperationCancelButton from "../stock-operations-dialog/stock-operations-cancel-button.component";
import StockOperationPrintButton from "../stock-operations-dialog/stock-operations-print-button.component";
import { StockOperationTypeHasPrint } from "../../core/api/types/stockOperation/StockOperationType";
import StockOperationApproveDispatchButton from "../stock-operations-dialog/stock-operations-approve-dispatch-button.component";
import StockOperationCompleteDispatchButton from "../stock-operations-dialog/stock-operations-completed-dispatch-button.component";
import StockOperationIssueStockButton from "../stock-operations-dialog/stock-operations-issue-stock-button.component";

const AddStockOperation: React.FC<AddStockOperationProps> = (props) => {
  const { t } = useTranslation();
  const { isLoading, isError, result } = useInitializeStockOperations(props);
  const [isNew, setIsNew] = useState(false);
  const [canPrint, setCanPrint] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [canApprove, setCanApprove] = useState(false);
  const [canReceiveItems, setCanReceiveItems] = useState(false);
  const [canDisplayReceivedItems, setCanDisplayReceivedItems] = useState(false);
  const [isRequisitionAndCanIssueStock, setIsRequisitionAndCanIssueStock] =
    useState(false);
  const [canUpdateBatchInformation, setCanUpdateBatchInformation] =
    useState(false);

  const [isEditing, setIsEditing] = useState<boolean>(props.isEditing);
  const [manageStockItems, setManageStockItems] = useState(props.isEditing);
  const [manageSubmitOrComplete, setManageSubmitOrComplete] = useState(
    props.isEditing
  );
  const [selectedIndex, setSelectedIndex] = useState(0);

  // let canEditModel = false;
  // let canViewModel = false;
  // let canApproveModel = false;

  if (isLoading) return <AccordionSkeleton />;
  if (isError) {
    closeOverlay();
    // TODO: Show an error
    return;
  }

  // if (isEditing) {
  // canEditModel = props.model?.permission?.canEdit ?? false;
  // canViewModel = props.model?.permission?.canView ?? false;
  // canApproveModel = props.model?.permission?.canApprove ?? false;
  // const canIssueStock =
  //   props.model?.permission?.isRequisitionAndCanIssueStock ?? false;
  // const canReceiveItems = props.model?.permission?.canReceiveItems ?? false;
  // const canDisplayReceivedItems =
  //   props.model?.permission?.canDisplayReceivedItems ?? false;
  // const canUpdateItemsBatchInformation =
  //   props.model?.permission?.canUpdateBatchInformation ?? false;

  // setCanEdit(canEditModel);
  // setCanApprove(canApproveModel);
  // setCanReceiveItems(canReceiveItems);
  // setCanDisplayReceivedItems(canDisplayReceivedItems);
  // setCanUpdateBatchInformation(canUpdateItemsBatchInformation);

  // setIsRequisitionAndCanIssueStock(canIssueStock);
  // setCanPrint(canIssueStock);
  // }

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
          canEdit={props.model.status === "NEW" ? true : false}
          model={props?.model ?? result.dto}
          onSave={async () => {
            setManageStockItems(true);
            setSelectedIndex(1);
          }}
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
          model={props?.model ?? result.dto}
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
          model={props?.model ?? result.dto}
          actions={{
            onSave: async (model) => {
              // TODO: Update
              await addOrEditStockOperation(
                model,
                props.operation,
                props.isEditing,
                props.operations
              );
            },
            onGoBack: () => {
              setSelectedIndex(1);
            },
            onComplete: () => {
              // TODO: Update
            },
            onSubmit: () => {
              // TODO: Update
            },
            onDispatch: () => {
              // TODO: Update
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
        {/* {((!canEdit && (canApprove || canReceiveItems)) ||
          (!isNew && (canEdit || canPrint)) ||
          isRequisitionAndCanIssueStock) && (
          <div
            style={{
              margin: "10px",
              display: "flex",
              flexDirection: "row",
            }}
          >
            {!canEdit && canApprove && (
              <>
                {!result.requiresDispatchAcknowledgement && (
                  <div style={{ margin: "2px" }}>
                    <StockOperationApprovalButton uuid={""} />
                  </div>
                )}
                {result.requiresDispatchAcknowledgement && (
                  <div style={{ margin: "2px" }}>
                    <StockOperationApproveDispatchButton uuid={""} />
                  </div>
                )}

                <div style={{ margin: "2px" }}>
                  <StockOperationRejectButton uuid={""} />
                </div>
                <div style={{ margin: "2px" }}>
                  <StockOperationReturnButton uuid={""} />
                </div>
                <div style={{ margin: "2px" }}>
                  <StockOperationCancelButton uuid={""} />
                </div>
                <div style={{ margin: "2px" }}>
                  <StockOperationPrintButton uuid={""} />
                </div>
              </>
            )}

            {!canEdit && canReceiveItems && (
              <>
                <div style={{ margin: "2px" }}>
                  <StockOperationCompleteDispatchButton uuid={""} />
                </div>
                <div style={{ margin: "2px" }}>
                  <StockOperationReturnButton uuid={""} />
                </div>
              </>
            )}

            {isNew && canEdit && (
              <div style={{ margin: "2px" }}>
                <StockOperationCancelButton uuid={""} />
              </div>
            )}

            {isRequisitionAndCanIssueStock && (
              <div style={{ margin: "2px" }}>
                <StockOperationIssueStockButton uuid={""} />
              </div>
            )}

            {!isNew && canPrint && <StockOperationPrintButton uuid={""} />}
          </div>
        )} */}
      </div>
      <VerticalTabs
        tabs={tabs}
        selectedIndex={selectedIndex}
        onChange={setSelectedIndex}
      />
    </>
  );
};

export default AddStockOperation;
