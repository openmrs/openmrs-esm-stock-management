import React from "react";
import { useTranslation } from "react-i18next";
import { useLocations } from "@openmrs/esm-framework";

interface AddStockItemProps {
  state?: string;
}

const AddStockItem: React.FC<AddStockItemProps> = () => {
  const { t } = useTranslation();

  const locations = useLocations();

  return <div>Add New</div>;
};

export default AddStockItem;
