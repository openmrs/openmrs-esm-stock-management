import { Button } from "@carbon/react";
import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { launchOverlay } from "../../core/components/overlay/hook";
import AddStockItem from "./add-stock-item.component";

const AddStockItemActionButton: React.FC = () => {
  const { t } = useTranslation();

  const handleClick = useCallback(() => {
    launchOverlay("Add Stock Item", <AddStockItem />);
  }, []);

  return (
    <Button onClick={handleClick} size="md" kind="primary">
      {t("stockmanagement.addnew", "Add New")}
    </Button>
  );
};

export default AddStockItemActionButton;
