import { showNotification, showToast } from "@openmrs/esm-framework";
import React, { useState } from "react";
import { deleteStockItemPackagingUnit } from "../../stock-items.resource";
import { useTranslation } from "react-i18next";
import { StockItemPackagingUOMDTO } from "../../../core/api/types/stockItem/StockItemPackagingUOM";
import styles from "../packaging-units/packaging-units.scss";
import {
  Button,
  ModalHeader,
  ModalBody,
  ModalFooter,
  TextArea,
} from "@carbon/react";

interface DeletePackagingUnitProps {
  row?: StockItemPackagingUOMDTO;
  closeModal: () => void;
}

const DeletePackagingUnit: React.FC<DeletePackagingUnitProps> = ({
  row,
  closeModal,
}) => {
  const { t } = useTranslation();

  const [reason, setReason] = useState("");

  const handleReasonChange = (e) => {
    setReason(e.target.value);
  };

  const handleDelete = (e) => {
    e.preventDefault();
    deleteStockItemPackagingUnit(row.uuid).then(
      () => {
        showToast({
          critical: true,
          title: t("deletePackagingUnitTitle", `Delete packing item `),
          kind: "success",
          description: t(
            "deletePackagingUnitMesaage",
            `Stock Item packing unit deleted Successfully`
          ),
        });
      },
      (error) => {
        showNotification({
          title: t(
            "deletePackingUnitErrorTitle",
            `Error Deleting a stock item packing unit`
          ),
          kind: "error",
          critical: true,
          description: error?.message,
        });
      }
    );
  };
  console.info(row.packagingUomName);
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
            `Would you really like to remove the packaging unit ${row?.packagingUomName} from the stock item?`
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
