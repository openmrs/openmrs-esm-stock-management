import { Button } from "@carbon/react";
import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { launchOverlay } from "../core/components/overlay/hook";
import AddStockSourceItem from "./add-stock-sources/add-stock-sources.component";
import { Add } from "@carbon/react/icons";

const AddStockSourceActionButton: React.FC = () => {
  const { t } = useTranslation();

  const handleClick = useCallback(() => {
    launchOverlay("Add Stock Source", <AddStockSourceItem />);
  }, []);

  return (
    <Button onClick={handleClick} size="md" kind="ghost">
      {t("stockmanagement.addnewsource", "Add New")}
      <Add size="24" style={{ fill: "currentColor" }} />
    </Button>
  );
};

export default AddStockSourceActionButton;
