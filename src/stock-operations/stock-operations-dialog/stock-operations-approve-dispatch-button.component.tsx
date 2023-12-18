import React, { useCallback } from "react";

import { Button } from "@carbon/react";
import { showModal } from "@openmrs/esm-framework";
import { useTranslation } from "react-i18next";
import { Departure } from "@carbon/react/icons";

interface StockOperationApproveDispatchButtonProps {
  uuid: string;
}

const StockOperationApproveDispatchButton: React.FC<
  StockOperationApproveDispatchButtonProps
> = ({ uuid }) => {
  const { t } = useTranslation();
  const launchApproveDispatchModal = useCallback(() => {
    const dispose = showModal("stock-operation-dialog", {
      title: "Approve",
      closeModal: () => dispose(),
    });
  }, []);

  return (
    <Button
      onClick={launchApproveDispatchModal}
      renderIcon={(props) => <Departure size={16} {...props} />}
    >
      {t("approve", "Approve Dispatch ")}
    </Button>
  );
};

export default StockOperationApproveDispatchButton;
