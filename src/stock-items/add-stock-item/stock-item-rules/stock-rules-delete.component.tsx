import React, { useState } from "react";
import { Button, InlineLoading } from "@carbon/react";
import { useTranslation } from "react-i18next";
import { TrashCan } from "@carbon/react/icons";
import { deleteStockRule } from "../../stock-items.resource";
import { showModal, showNotification, showToast } from "@openmrs/esm-framework";

interface StockRulesDeleteActionMenuProps {
  uuid: string;
}

const StockRulesDeleteActionMenu: React.FC<StockRulesDeleteActionMenuProps> = ({
  uuid,
}) => {
  const { t } = useTranslation();

  const [deletingRule, setDeletingRule] = useState(false);

  const handleDeleteStockRule = React.useCallback(() => {
    const close = showModal("delete-stock-rule-modal", {
      close: () => close(),
      uuid: uuid,
      onConfirmation: () => {
        deleteStockRule(uuid)
          .then(
            () => {
              setDeletingRule(false);
              showToast({
                critical: true,
                title: t("deletingRule", "Delete Rule"),
                kind: "success",
                description: t(
                  "stockruledeletedsuccessfully",
                  "Stock Rule Deleted Successfully"
                ),
              });
            },
            (error) => {
              setDeletingRule(false);
              showNotification({
                title: t(`errorDeletingRule', 'error deleting a rule`),
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
      onClick={handleDeleteStockRule}
      iconDescription={t("deleteRule", "Delete Rule")}
      renderIcon={(props) => <TrashCan size={16} {...props} />}
    />
  );

  return deletingRule ? <InlineLoading /> : deleteButton;
};

export default StockRulesDeleteActionMenu;
