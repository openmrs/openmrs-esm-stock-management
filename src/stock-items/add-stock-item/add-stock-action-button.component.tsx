import { Button } from "@carbon/react";
import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { initialValues } from "./add-stock-item.resource";
import { launchAddOrEditDialog } from "../stock-item.utils";

const AddStockItemActionButton: React.FC = () => {
  const { t } = useTranslation();

  const handleClick = useCallback(() => {
    launchAddOrEditDialog(t, initialValues, false);
  }, []);

  return (
    <Button onClick={handleClick} size="md" kind="primary">
      {t("stockmanagement.addnew", "Add New")}
    </Button>
  );
};

export default AddStockItemActionButton;
