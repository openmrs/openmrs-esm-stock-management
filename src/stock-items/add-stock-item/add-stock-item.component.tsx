import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import StockItemDetails from "./stock-item-details/stock-item-details.component";
import { TabItem } from "../../core/components/tabs/types";
import PackagingUnits from "./packaging-units/packaging-units.component";
import Transactions from "./transactions/transactions.component";
import BatchInformation from "./batch-information/batch-information.component";
import StockQuantities from "./quantities/quantities.component";
import StockRules from "./stock-rules/stock-rules.component";
import VerticalTabs from "../../core/components/tabs/vertical-tabs.component";
import { StockItemDTO } from "../../core/api/types/stockItem/StockItem";
import { useForm } from "react-hook-form";
import { initialValues } from "./add-stock-item.resource";

interface AddStockItemProps {
  isEditing?: boolean;
  model?: StockItemDTO;
}

const AddEditStockItem: React.FC<AddStockItemProps> = ({
  isEditing,
  model,
}) => {
  const { t } = useTranslation();

  const tabs: TabItem[] = [
    {
      name: t("stockItemDetails", "Stock Item Details"),
      component: <StockItemDetails model={model} />,
    },
    {
      name: t("packagingUnits", "Packaging Units"),
      component: <PackagingUnits />,
      disabled: !isEditing,
    },
    {
      name: t("transactions", "Transactions"),
      component: <Transactions />,
      disabled: !isEditing,
    },
    {
      name: t("batchInformation", "Batch Information"),
      component: <BatchInformation />,
      disabled: !isEditing,
    },
    {
      name: t("quantities", "Quantities"),
      component: <StockQuantities />,
      disabled: !isEditing,
    },
    {
      name: t("stockRules", "Stock Rules"),
      component: <StockRules />,
      disabled: !isEditing,
    },
  ];

  return <VerticalTabs tabs={tabs} />;
};

export default AddEditStockItem;
