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

interface StockOperationReturnButtonProps {
  uuid: string;
}

const StockOperationReturnButton: React.FC<StockOperationReturnButtonProps> = ({
  uuid,
}) => {
  const { t } = useTranslation();
  const launchReturnModal = useCallback(() => {
    const dispose = showModal("stock-operation-dialog", {
      title: "Return",
      closeModal: () => dispose(),
    });
  }, []);

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
