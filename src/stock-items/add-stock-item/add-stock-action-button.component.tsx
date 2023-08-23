import { Button } from "@carbon/react";
import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { launchOverlay } from "../../core/components/overlay/hook";
import AddEditStockItem from "./add-stock-item.component";
import { initialValues } from "./add-stock-item.resource";

const AddStockItemActionButton: React.FC = () => {
  const { t } = useTranslation();

  const handleClick = useCallback(() => {
    launchOverlay("Add Stock Item", <AddEditStockItem model={initialValues} />);
  }, []);

  return (
    <Button onClick={handleClick} size="md" kind="primary">
      {t("stockmanagement.addnew", "Add New")}
    </Button>
  );
};

export default AddStockItemActionButton;
