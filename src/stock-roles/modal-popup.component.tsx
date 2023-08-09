import { Modal } from "@carbon/react";
import React, { useMemo, useState } from "react";
import { Splash } from "../components/spinner/Splash";
import { UserRoleScope } from "../core/api/types/identity/UserRoleScope";
import { useCreateOrUpdateUserRoleScopeMutation } from "../core/api/userRoleScope";
import { errorAlert, successAlert } from "../core/utils/alert";
import { toErrorMessage } from "../core/utils/stringUtils";
import useTranslation from "../core/utils/translation";
import { EditUserScope } from "./edit-user-scope.component";

export interface ModalPopupProps {
  model: UserRoleScope;
  onClose: (refresh: boolean) => void;
}

export const ModalPopup: React.FC<ModalPopupProps> = ({ model, onClose }) => {
  const { t } = useTranslation();
  const [openModal] = useState(true);
  const [validateForm, setValidateForm] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  const [createOrUpdateUserRoleScope] =
    useCreateOrUpdateUserRoleScopeMutation();

  const isNew = useMemo(() => {
    return model?.uuid == null;
  }, [model]);

  function onCancel() {
    onClose?.(false);
  }

  const onValidationComplete = async (
    isSuccess: boolean,
    updatedModel: UserRoleScope
  ) => {
    setValidateForm(false);
    if (isSuccess) {
      try {
        setShowSplash(true);
        createOrUpdateUserRoleScope(updatedModel)
          .unwrap()
          .then((payload: any) => {
            if ((payload as any).error) {
              var errorMessage = toErrorMessage(payload);
              errorAlert(
                `${t(
                  updatedModel.uuid == null
                    ? "stockmanagement.userrolescope.createfailed"
                    : "stockmanagement.userrolescope.updatefailed"
                )} ${errorMessage}`
              );
              return;
            } else {
              successAlert(
                `${t(
                  updatedModel.uuid == null
                    ? "stockmanagement.userrolescope.createsuccess"
                    : "stockmanagement.userrolescope.updatesuccess"
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
                  ? "stockmanagement.userrolescope.createfailed"
                  : "stockmanagement.userrolescope.updatefailed"
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
        size="lg"
        primaryButtonText={t("stockmanagement.save")}
        secondaryButtonText={t("stockmanagement.cancel")}
        primaryButtonDisabled={validateForm}
        modalLabel={isNew ? "" : t("stockmanagement.userrolescope.edit.title")}
        modalHeading={
          isNew
            ? t("stockmanagement.userrolescope.new.title")
            : `${model?.userFamilyName} ${model?.userGivenName}`
        }
        onRequestClose={onCancel}
        shouldSubmitOnEnter={false}
        onRequestSubmit={onSave}
        onSecondarySubmit={onCancel}
      >
        <EditUserScope
          model={model}
          isNew={isNew}
          validateForm={validateForm}
          onValidationComplete={onValidationComplete}
        />
      </Modal>
    </>
  );
};
