import React, { useCallback } from "react";

import { Button } from "@carbon/react";
import { showModal } from "@openmrs/esm-framework";
import { useTranslation } from "react-i18next";
import { CheckmarkOutline } from "@carbon/react/icons";

interface StockOperationApprovalButtonProps {
  uuid: string;
}

const StockOperationApprovalButton: React.FC<
  StockOperationApprovalButtonProps
> = ({ uuid }) => {
  const { t } = useTranslation();
  const launchApprovalModal = useCallback(() => {
    const dispose = showModal("stock-operation-dialog", {
      title: "Approve",
      closeModal: () => dispose(),
    });
  }, []);

  return (
    <Button
      onClick={launchApprovalModal}
      renderIcon={(props) => <CheckmarkOutline size={16} {...props} />}
    >
      {t("approve", "Approve ")}
    </Button>
  );
};

export default StockOperationApprovalButton;
