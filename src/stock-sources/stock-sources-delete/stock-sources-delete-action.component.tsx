import React from "react";
import { Button } from "@carbon/react";
import { TrashCan } from "@carbon/react/icons";
import { useTranslation } from "react-i18next";

const DeleteStockSourcesActionMenu: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Button
      kind="ghost"
      iconDescription={t("deleteSource", "Delete Source")}
      renderIcon={(props) => <TrashCan size={16} {...props} />}
    />
  );
};

export default DeleteStockSourcesActionMenu;
