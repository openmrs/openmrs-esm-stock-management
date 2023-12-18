import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { TabItem } from "../../core/components/tabs/types";
import VerticalTabs from "../../core/components/tabs/vertical-tabs.component";
import BaseOperationDetails from "./base-operation-details.component";
import StockItemsAddition from "./stock-items-addition.component";
import StockOperationSubmission from "./stock-operation-submission.component";
import { AddStockOperationProps } from "./types";
import { useInitializeStockOperations } from "./add-stock-operation.resource";
import { AccordionSkeleton, Button } from "@carbon/react";
import { closeOverlay } from "../../core/components/overlay/hook";
import { addOrEditStockOperation } from "../stock-operation.utils";
import {
  Printer,
  Error,
  Repeat,
  CloseOutline,
  CheckmarkOutline,
} from "@carbon/react/icons";

const AddStockOperation: React.FC<AddStockOperationProps> = (props) => {
  const { t } = useTranslation();
  const { isLoading, isError, result } = useInitializeStockOperations(props);
  const [isEditing, setIsEditing] = useState(props.isEditing);
  const [manageStockItems, setManageStockItems] = useState(props.isEditing);
  const [manageSubmitOrComplete, setManageSubmitOrComplete] = useState(
    props.isEditing
  );
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (isLoading) return <AccordionSkeleton />;
  if (isError) {
    closeOverlay();
    // TODO: Show an error
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
        <div
          style={{
            margin: "10px",
            display: "flex",
            flexDirection: "row",
          }}
        >
          <div style={{ margin: "2px" }}>
            <Button
              renderIcon={(props) => <CheckmarkOutline size={16} {...props} />}
            >
              Approve
            </Button>
          </div>
          <div style={{ margin: "2px" }}>
            <Button
              kind=""
              renderIcon={(props) => <CloseOutline size={16} {...props} />}
            >
              Reject
            </Button>
          </div>
          <div style={{ margin: "2px" }}>
            <Button
              kind="tertiary"
              renderIcon={(props) => <Repeat size={16} {...props} />}
            >
              Return
            </Button>
          </div>
          <div style={{ margin: "2px" }}>
            <Button
              kind="danger--ghost"
              renderIcon={(props) => <Error size={16} {...props} />}
            >
              Cancel
            </Button>
          </div>
          <div style={{ margin: "2px" }}>
            <Button
              kind="tertiary"
              renderIcon={(props) => <Printer size={16} {...props} />}
            >
              Print
            </Button>
          </div>
        </div>
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
