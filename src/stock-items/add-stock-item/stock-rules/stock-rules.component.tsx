import React from "react";
import { useTranslation } from "react-i18next";
import { useLocations } from "@openmrs/esm-framework";
import addStockStyles from "../add-stock-item.scss";

interface StockRulesProps {
  onSubmit?: () => void;
}

const StockRules: React.FC<StockRulesProps> = () => {
  const { t } = useTranslation();

  const locations = useLocations();

  return (
    <div className={addStockStyles.formContainer}>
      Stock rules Coming soon ...
    </div>
  );
};

export default StockRules;
