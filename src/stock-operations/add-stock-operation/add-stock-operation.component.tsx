import React, { useCallback, useState } from "react";
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
import { toErrorMessage } from "../../core/utils/stringUtils";
import { errorAlert } from "../../core/utils/alert";
import { addOrEditStockOperation } from "../stock-operation.utils";

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
      name: `${props.operation.name} Details`,
      component: (
        <BaseOperationDetails
          {...props}
          setup={result}
          model={result?.dto}
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
          setup={result}
          model={result?.dto}
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
          setup={result}
          model={result?.dto}
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
    <VerticalTabs
      tabs={tabs}
      selectedIndex={selectedIndex}
      onChange={setSelectedIndex}
    />
  );
};

export default AddStockOperation;
