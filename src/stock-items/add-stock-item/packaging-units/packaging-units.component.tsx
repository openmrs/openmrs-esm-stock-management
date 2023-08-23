import React from "react";
import { useTranslation } from "react-i18next";
import addStockStyles from "../add-stock-item.scss";

interface PackagingUnitsProps {
  onSubmit?: () => void;
}

const PackagingUnits: React.FC<PackagingUnitsProps> = () => {
  const { t } = useTranslation();

  return (
    <div className={addStockStyles.formContainer}>
      Packaging units Coming soon ...
    </div>
  );
};

export default PackagingUnits;
