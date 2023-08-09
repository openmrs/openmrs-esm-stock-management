import { Modal } from "@carbon/react";
import React, { useMemo, useState } from "react";
import { Splash } from "../components/spinner/Splash";
import { useCreateOrUpdateStockSourceMutation } from "../core/api/stockSource";
import { StockSource } from "../core/api/types/stockOperation/StockSource";
import { errorAlert, successAlert } from "../core/utils/alert";
import { toErrorMessage } from "../core/utils/stringUtils";
import useTranslation from "../core/utils/translation";
import { EditStockSource } from "./edit-stock-source.component";

export interface ModalPopupProps {
  model: StockSource;
  onClose: (refresh: boolean) => void;
}

export const ModalPopup: React.FC<ModalPopupProps> = ({ model, onClose }) => {
  const { t } = useTranslation();
  const [openModal] = useState(true);
  const [validateForm, setValidateForm] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  const [createOrUpdateStockSource] = useCreateOrUpdateStockSourceMutation();

  const isNew = useMemo(() => {
    return model?.uuid == null;
  }, [model]);

  function onCancel() {
    onClose?.(false);
  }

  const onValidationComplete = async (
    isSuccess: boolean,
    updatedModel: StockSource
  ) => {
    setValidateForm(false);
    if (isSuccess) {
      try {
        setShowSplash(true);
        createOrUpdateStockSource(updatedModel)
          .unwrap()
          .then((payload: any) => {
            if ((payload as any).error) {
              var errorMessage = toErrorMessage(payload);
              errorAlert(
                `${t(
                  updatedModel.uuid == null
                    ? "stockmanagement.stocksource.createfailed"
                    : "stockmanagement.stocksource.updatefailed"
                )} ${errorMessage}`
              );
              return;
            } else {
              successAlert(
                `${t(
                  updatedModel.uuid == null
                    ? "stockmanagement.stocksource.createsuccess"
                    : "stockmanagement.stocksource.updatesuccess"
                )}`
              );
              onClose?.(true);
            }
          })
          .catch((error) => {
            var errorMessage = toErrorMessage(error);
            errorAlert(
              `${t(
                updatedModel.uuid == null
                  ? "stockmanagement.stocksource.createfailed"
                  : "stockmanagement.stocksource.updatefailed"
              )} ${errorMessage}`
            );
            return;
          });
      } finally {
        setShowSplash(false);
      }
    }
  };

  function onSave() {
    setValidateForm(true);
  }

  return (
    <>
      <Splash active={showSplash} blockUi={true} />
      <Modal
        open={openModal}
        primaryButtonText={t("stockmanagement.save")}
        secondaryButtonText={t("stockmanagement.cancel")}
        primaryButtonDisabled={validateForm}
        modalLabel={isNew ? "" : t("stockmanagement.stocksource.edit.title")}
        modalHeading={
          isNew ? t("stockmanagement.stocksource.new.title") : `${model?.name}`
        }
        onRequestClose={onCancel}
        shouldSubmitOnEnter={false}
        onRequestSubmit={onSave}
        onSecondarySubmit={onCancel}
      >
        <EditStockSource
          model={model}
          isNew={isNew}
          validateForm={validateForm}
          onValidationComplete={onValidationComplete}
        />
      </Modal>
    </>
  );
};
