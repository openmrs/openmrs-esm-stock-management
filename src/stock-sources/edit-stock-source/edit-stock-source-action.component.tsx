import { Button } from "@carbon/react";
import { Edit } from "@carbon/react/icons";

import React from "react";
import { useTranslation } from "react-i18next";

const EditSourceActionsMenu: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Button
      kind="ghost"
      iconDescription={t("editSource", "Edit Source")}
      renderIcon={(props) => <Edit size={16} {...props} />}
    />
  );
};
export default EditSourceActionsMenu;
