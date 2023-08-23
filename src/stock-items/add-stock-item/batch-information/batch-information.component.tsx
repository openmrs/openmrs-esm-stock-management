import React from "react";
import { useTranslation } from "react-i18next";
import { useLocations } from "@openmrs/esm-framework";
import addStockStyles from "../add-stock-item.scss";

interface BatchInformationProps {
  onSubmit?: () => void;
}

const BatchInformation: React.FC<BatchInformationProps> = () => {
  const { t } = useTranslation();

  const locations = useLocations();

  return (
    <div className={addStockStyles.formContainer}>
      Batch information Coming soon ...
    </div>
  );
};

export default BatchInformation;
