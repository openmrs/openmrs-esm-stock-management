import React, { useCallback } from "react";
import { Button } from "@carbon/react";
import { Edit } from "@carbon/react/icons";

import { useTranslation } from "react-i18next";
import { launchOverlay } from "../../../core/components/overlay/hook";
import StockRulesAddOrUpdate from "./add-stock-rules.component";
import { StockRule } from "../../../core/api/types/stockItem/StockRule";

interface EditStockRulesActionMenuProps {
  data?: StockRule;
  stockItemUuid?: string;
}

const EditStockRuleActionsMenu: React.FC<EditStockRulesActionMenuProps> = ({
  data,
  stockItemUuid,
}) => {
  const { t } = useTranslation();
  const handleClick = useCallback(() => {
    launchOverlay(
      "Edit Stock Rule",
      <StockRulesAddOrUpdate model={data} stockItemUuid={data.stockItemUuid} />
    );
  }, [data]);

  return (
    <Button
      kind="ghost"
      size="md"
      onClick={() => handleClick()}
      iconDescription={t("editStockRule", "Edit Stock Rule")}
      renderIcon={(props) => <Edit size={16} {...props} />}
    />
  );
};
export default EditStockRuleActionsMenu;
