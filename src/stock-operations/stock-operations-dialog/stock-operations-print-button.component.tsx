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

interface StockOperationCancelButtonProps {
  uuid: string;
}

const StockOperationPrintButton: React.FC<StockOperationCancelButtonProps> = ({
  uuid,
}) => {
  const { t } = useTranslation();
  const launchPrintModal = useCallback(() => {
    const dispose = showModal("stock-operation-dialog", {
      title: "Print",
      closeModal: () => dispose(),
    });
  }, []);

  return (
    <Button
      onClick={launchPrintModal}
      kind="tertiary"
      renderIcon={(props) => <Error size={16} {...props} />}
    >
      {t("print", "Print ")}
    </Button>
  );
};

export default StockOperationPrintButton;
