import { Modal, TextArea } from "@carbon/react";
import React, { useEffect, useState } from "react";
import useTranslation from "../../core/utils/translation";

export interface ConfirmModalPopupProps {
  confirmType: string;
  confirmLabel: string;
  confirmHeading: string;
  confirmText: string;
  defaultReason: string;
  requireReason: boolean;
  onClose: (refresh: boolean) => void;
  onConfirm: (
    confirmType: string,
    reason: string | null,
    confirmParam?: string
  ) => void;
  showModal: boolean;
  confirmParam?: string;
}

export const ConfirmModalPopup: React.FC<ConfirmModalPopupProps> = ({
  onClose,
  confirmText,
  confirmType,
  confirmLabel,
  defaultReason,
  requireReason,
  confirmHeading,
  onConfirm,
  showModal,
  confirmParam,
}) => {
  const { t } = useTranslation();
  const [openModal, setOpenModal] = useState(false);
  const [reason, setReason] = useState("");
  const [confirmParamToUse, setconfirmParam] = useState<string | undefined>();
  const [reasonInvalid, setReasonInvalid] = useState(false);

  useEffect(() => {
    setReasonInvalid(false);
    setReason(defaultReason);
    setconfirmParam(confirmParam);
  }, [confirmParam, defaultReason]);

  useEffect(() => {
    setOpenModal(showModal);
  }, [showModal]);

  function onCancel() {
    setReason("");
    setReasonInvalid(false);
    onClose?.(false);
  }

  const onConfirmAction = () => {
    let reasonForConfirm: string | null = null;
    if (requireReason) {
      reasonForConfirm = reason.trim();
      if (reasonForConfirm.length === 0) {
        setReasonInvalid(true);
        return;
      }
    }
    onConfirm(confirmType, reasonForConfirm, confirmParamToUse);
  };

  const onReasonChange = (evt: React.ChangeEvent<HTMLTextAreaElement>) => {
    setReasonInvalid(false);
    setReason(evt.target.value);
  };

  return (
    <>
      <Modal
        size="sm"
        open={openModal}
        primaryButtonText={t("stockmanagement.yes")}
        secondaryButtonText={t("stockmanagement.no")}
        primaryButtonDisabled={requireReason && reason.trim().length === 0}
        modalLabel={t(confirmLabel)}
        modalHeading={t(confirmHeading)}
        onRequestClose={onCancel}
        shouldSubmitOnEnter={false}
        onRequestSubmit={onConfirmAction}
        onSecondarySubmit={onCancel}
      >
        <label className="white-space-pre-wrap">{t(confirmText)}</label>
        {requireReason && (
          <TextArea
            id="confirmReason"
            name="confirmReason"
            value={reason ?? ""}
            invalid={reasonInvalid}
            invalidText={t("stockmanagement.field.required")}
            onChange={onReasonChange}
            maxLength={255}
            labelText={t("stockmanagement.stockoperation.confirm.reason")}
          />
        )}
      </Modal>
    </>
  );
};
