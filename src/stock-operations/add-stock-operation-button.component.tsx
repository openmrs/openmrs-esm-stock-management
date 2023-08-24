import { Button } from "@carbon/react";
import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { launchOverlay } from "../core/components/overlay/hook";
import AddStockOperation from "./add-stock-operation/add-stock-operation.component";

const AddStockOperationActionButton: React.FC = () => {
  const { t } = useTranslation();

  const handleClick = useCallback(() => {
    launchOverlay("Add Stock Operation", <AddStockOperation />);
  }, []);

  return (
    <Button onClick={handleClick} size="md" kind="primary">
      {t("stockmanagement.addnewoperation", "Add New Operation")}
    </Button>
  );
};

export default AddStockOperationActionButton;
