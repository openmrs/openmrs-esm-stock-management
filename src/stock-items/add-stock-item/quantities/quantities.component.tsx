import React from "react";
import { useTranslation } from "react-i18next";
import { useLocations } from "@openmrs/esm-framework";
import addStockStyles from "../add-stock-item.scss";

interface StockQuantitiesProps {
  onSubmit?: () => void;
}

const StockQuantities: React.FC<StockQuantitiesProps> = () => {
  const { t } = useTranslation();

  const locations = useLocations();

  return (
    <div className={addStockStyles.formContainer}>
      Quantities Coming soon ...
    </div>
  );
};

export default StockQuantities;
