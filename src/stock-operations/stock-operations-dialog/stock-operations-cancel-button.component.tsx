import React, { useCallback, useMemo, useState } from "react";

import { Button } from "@carbon/react";
import { showModal } from "@openmrs/esm-framework";
import { useTranslation } from "react-i18next";
import { Error } from "@carbon/react/icons";

interface StockOperationCancelButtonProps {
  uuid: string;
}

const StockOperationCancelButton: React.FC<StockOperationCancelButtonProps> = ({
  uuid,
}) => {
  const { t } = useTranslation();
  const launchCancelModal = useCallback(() => {
    const dispose = showModal("stock-operation-dialog", {
      title: "Cancel",
      closeModal: () => dispose(),
    });
  }, []);

  return (
    <Button
      onClick={launchCancelModal}
      kind="danger--ghost"
      renderIcon={(props) => <Error size={16} {...props} />}
    >
      {t("cancel", "Cancel ")}
    </Button>
  );
};

export default StockOperationCancelButton;
