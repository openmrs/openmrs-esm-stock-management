import React, { useCallback, useMemo, useState } from "react";

import { Button } from "@carbon/react";
import { showModal } from "@openmrs/esm-framework";
import { useTranslation } from "react-i18next";
import {
  Printer,
  Error,
  Repeat,
  CloseOutline,
  CheckmarkOutline,
} from "@carbon/react/icons";
import { StockOperationDTO } from "../../core/api/types/stockOperation/StockOperationDTO";

interface StockOperationReturnButtonProps {
  operation: StockOperationDTO;
}

const StockOperationReturnButton: React.FC<StockOperationReturnButtonProps> = ({
  operation,
}) => {
  const { t } = useTranslation();
  const launchReturnModal = useCallback(() => {
    const dispose = showModal("stock-operation-dialog", {
      title: "Return",
      operation: operation,
      requireReason: true,
      closeModal: () => dispose(),
    });
  }, [operation]);

  return (
    <Button
      onClick={launchReturnModal}
      kind="tertiary"
      renderIcon={(props) => <CloseOutline size={16} {...props} />}
    >
      {t("return", "Return ")}
    </Button>
  );
};

export default StockOperationReturnButton;
