import React from "react";
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

const AddStockOperation: React.FC<AddStockOperationProps> = (props) => {
  const { t } = useTranslation();
  const { isLoading, isError, result } = useInitializeStockOperations(props);

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
        <BaseOperationDetails {...props} setup={result} model={result?.dto} />
      ),
    },
    {
      name: t("stockItems", "Stock Items"),
      component: (
        <StockItemsAddition {...props} setup={result} model={result?.dto} />
      ),
    },
    {
      name: t("submitOrComplete", "Submit/Complete"),
      component: (
        <StockOperationSubmission
          {...props}
          setup={result}
          model={result?.dto}
        />
      ),
      disabled: !props.isEditing,
    },
  ];

  return <VerticalTabs tabs={tabs} />;
};

export default AddStockOperation;
