import React, { useState } from "react";
import { Button, InlineLoading } from "@carbon/react";
import { useTranslation } from "react-i18next";
import { TrashCan } from "@carbon/react/icons";
import { deleteUserRoleScopes } from "../stock-user-role-scopes.resource";
import {
  restBaseUrl,
  showModal,
  showNotification,
  showToast,
} from "@openmrs/esm-framework";
import { handleMutate } from "../../utils";

interface StockUserScopDeleteActionMenuProps {
  uuid: string;
}

const StockUserScopeDeleteActionMenu: React.FC<
  StockUserScopDeleteActionMenuProps
> = ({ uuid }) => {
  const { t } = useTranslation();

  const [deletingUserScope, setDeletingUserScope] = useState(false);

  const handleDeleteStockUserScope = React.useCallback(() => {
    const close = showModal("delete-stock-user-scope-modal", {
      close: () => close(),
      uuid: uuid,
      onConfirmation: () => {
        const ids = [];
        ids.push(uuid);
        deleteUserRoleScopes(ids)
          .then(
            () => {
              handleMutate(`${restBaseUrl}/stockmanagement/userrolescope`);
              setDeletingUserScope(false);
              showToast({
                critical: true,
                title: t("deletingstockUserScope", "Delete Stock User Scope"),
                kind: "success",
                description: t(
                  "stockuserscopedeletedsuccessfully",
                  "Stock User Scope Deleted Successfully"
                ),
              });
            },
            (error) => {
              setDeletingUserScope(false);
              showNotification({
                title: t(
                  `errorDeletingUserScope', 'error deleting a user scope`
                ),
                kind: "error",
                critical: true,
                description: error?.message,
              });
            }
          )
          .catch();
        close();
      },
    });
  }, [t, uuid]);

  const deleteButton = (
    <Button
      kind="ghost"
      size="md"
      onClick={handleDeleteStockUserScope}
      iconDescription={t("deleteUserScope", "Delete Stock User Scope")}
      renderIcon={(props) => <TrashCan size={16} {...props} />}
    />
  );

  return deletingUserScope ? <InlineLoading /> : deleteButton;
};

export default StockUserScopeDeleteActionMenu;
