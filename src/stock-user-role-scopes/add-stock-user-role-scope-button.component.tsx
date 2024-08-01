import { Button } from "@carbon/react";
import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { launchOverlay } from "../core/components/overlay/hook";
import AddStockUserRoleScope from "./add-stock-user-scope/add-stock-user-role-scope.component";

const AddStockUserRoleScopeActionButton: React.FC = () => {
  const { t } = useTranslation();

  const handleClick = useCallback(() => {
    launchOverlay(
      t("addStockUserRoleScope", "Add Stock User Role Scope"),
      <AddStockUserRoleScope />
    );
  }, []);

  return (
    <Button onClick={handleClick} size="md" kind="primary">
      {t("stockmanagement.addnewuserrolescope", "Add New User Role Scope")}
    </Button>
  );
};

export default AddStockUserRoleScopeActionButton;
