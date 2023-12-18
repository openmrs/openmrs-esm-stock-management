import React, { useCallback } from "react";

import { Button } from "@carbon/react";
import { showModal } from "@openmrs/esm-framework";
import { useTranslation } from "react-i18next";
import { CheckmarkOutline } from "@carbon/react/icons";

interface StockOperationCompleteDispatchButtonProps {
  uuid: string;
}

const StockOperationCompleteDispatchButton: React.FC<
  StockOperationCompleteDispatchButtonProps
> = ({ uuid }) => {
  const { t } = useTranslation();
  const launchcompletedDispatchModal = useCallback(() => {
    const dispose = showModal("stock-operation-dialog", {
      title: "Complete Dispatch",
      closeModal: () => dispose(),
    });
  }, []);

  return (
    <Button
      onClick={launchcompletedDispatchModal}
      renderIcon={(props) => <CheckmarkOutline size={16} {...props} />}
    >
      {t("complete", "Complete Dispatch ")}
    </Button>
  );
};

export default StockOperationCompleteDispatchButton;
