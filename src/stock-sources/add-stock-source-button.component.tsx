import { Button } from "@carbon/react";
import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { launchOverlay } from "../core/components/overlay/hook";
import AddStockSourceItem from "./add-stock-sources/add-stock-sources.component";

const AddStockSourceActionButton: React.FC = () => {
  const { t } = useTranslation();

  const handleClick = useCallback(() => {
    launchOverlay("Add Stock Source", <AddStockSourceItem />);
  }, []);

  return (
    <Button onClick={handleClick} size="md" kind="primary">
      {t("stockmanagement.addnewsource", "Add New Source")}
    </Button>
  );
};

export default AddStockSourceActionButton;
