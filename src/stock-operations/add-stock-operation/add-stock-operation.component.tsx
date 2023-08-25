import React from "react";
import { SaveStockOperation } from "../../stock-items/types";
import { useTranslation } from "react-i18next";
import { TabItem } from "../../core/components/tabs/types";
import VerticalTabs from "../../core/components/tabs/vertical-tabs.component";
import { StockOperationDTO } from "../../core/api/types/stockOperation/StockOperationDTO";
import BaseOperationDetails from "./base-operation-details.component";
import StockItemsAddition from "./stock-items-addition.component";
import StockOperationSubmission from "./stock-operation-submission.component";
import { StockOperationType } from "../../core/api/types/stockOperation/StockOperationType";

interface AddStockOperationProps {
  isEditing?: boolean;
  model?: StockOperationDTO;
  onSave?: SaveStockOperation;
  operation: StockOperationType;
}

const AddStockOperation: React.FC<AddStockOperationProps> = (props) => {
  const { t } = useTranslation();

  const tabs: TabItem[] = [
    {
      name: `${props.operation.name} Details`,
      component: <BaseOperationDetails {...props} />,
    },
    {
      name: t("stockItems", "Stock Items"),
      component: <StockItemsAddition {...props} />,
      disabled: !props.isEditing,
    },
    {
      name: t("submitOrComplete", "Submit/Complete"),
      component: <StockOperationSubmission {...props} />,
      disabled: !props.isEditing,
    },
  ];

  return <VerticalTabs tabs={tabs} />;
};

export default AddStockOperation;
