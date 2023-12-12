import { Button } from "@carbon/react";
import { Edit } from "@carbon/react/icons";

import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { launchOverlay } from "../../core/components/overlay/hook";
import StockSourcesEditOrCreate from "../add-stock-sources/add-stock-sources.component";

const EditSourceActionsMenu: React.FC = () => {
  const { t } = useTranslation();

  const handleClick = useCallback(() => {
    launchOverlay("Edit Stock Source", <StockSourcesEditOrCreate />);
  }, []);

  return (
    <Button
      kind="ghost"
      onClick={handleClick}
      iconDescription={t("editSource", "Edit Source")}
      renderIcon={(props) => <Edit size={16} {...props} />}
    />
  );
};
export default EditSourceActionsMenu;
