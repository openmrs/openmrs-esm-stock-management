import React, { useState, useEffect } from "react";
import { showSnackbar } from "@openmrs/esm-framework";
import {
  Button,
  ModalHeader,
  ModalBody,
  ModalFooter,
  TextArea,
} from "@carbon/react";
import { deleteStockItemPackagingUnit } from "../../stock-items.resource";
import { useStockItemPackageUnitsHook } from "./packaging-units.resource";
import { useTranslation } from "react-i18next";
import { StockItemPackagingUOMDTO } from "../../../core/api/types/stockItem/StockItemPackagingUOM";

import styles from "../packaging-units/packaging-units.scss";

interface DeletePackagingUnitProps {
  row?: StockItemPackagingUOMDTO;
  closeModal: () => void;
}

const DeletePackagingUnit: React.FC<DeletePackagingUnitProps> = ({
  row,
  closeModal,
}) => {
  const { t } = useTranslation();
  const { mutate, setStockItemUuid } = useStockItemPackageUnitsHook();

  useEffect(() => {
    setStockItemUuid(row.stockItemUuid);
  }, [row.stockItemUuid, setStockItemUuid]);

  const [reason, setReason] = useState("");

  const handleReasonChange = (e) => {
    setReason(e.target.value);
  };

  const handleDelete = (e) => {
    e.preventDefault();
    deleteStockItemPackagingUnit(row.uuid).then(
      () => {
        mutate();
        closeModal();
        showSnackbar({
          isLowContrast: true,
          title: t("deletePackagingUnitTitle", "Delete packing item"),
          kind: "success",
          subtitle: t(
            "deletePackagingUnitMesaage",
            "Stock Item packing unit deleted Successfully"
          ),
        });
      },
      (error) => {
        showSnackbar({
          title: t(
            "deletePackingUnitErrorTitle",
            "Error Deleting a stock item packing unit"
          ),
          kind: "error",
          isLowContrast: true,
          subtitle: error?.message,
        });
      }
    );
  };

  return (
    <div>
      <ModalHeader
        closeModal={closeModal}
        className={styles.productiveHeading03}
      >
        {t("removePackagingUnit", "Remove Packaging Unit")}?
      </ModalHeader>
      <ModalBody>
        <span>
          {t(
            "removePackagingUnitConfirmation",
            "Would you really like to remove the packaging unit ${row?.packagingUomName} from the stock item?"
          )}
        </span>
        <TextArea
          id="reason"
          labelText={t("reasonLabel", "Please explain the reason:")}
          onChange={handleReasonChange}
          maxLength={500}
          placeholder={t("reasonPlaceholder", "Enter reason here")}
        />
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={closeModal}>
          {t("no", "No")}
        </Button>
        <Button
          kind="danger"
          type="submit"
          onClick={handleDelete}
          disabled={reason.length < 1}
        >
          {t("yes", "Yes")}
        </Button>
      </ModalFooter>
    </div>
  );
};

export default DeletePackagingUnit;
