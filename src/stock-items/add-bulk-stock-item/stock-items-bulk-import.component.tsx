import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Button,
  Form,
  ModalBody,
  ModalFooter,
  ModalHeader,
  FileUploader,
} from "@carbon/react";
import { UploadStockItems } from "./stock-items-bulk-import.resource";
import { showSnackbar } from "@openmrs/esm-framework";

export interface ImportDialogPopupProps {
  closeModal: () => void;
}

const ImportDialogPopup: React.FC<ImportDialogPopupProps> = ({
  closeModal,
}) => {
  const { t } = useTranslation();
  const [selectedFile, setSelectedFile] = useState<any>();

  const onConfirmUpload = () => {
    if (!selectedFile) {
      return;
    }
    const formData = new FormData();
    if (selectedFile) {
      formData.append("file", selectedFile, "Import_Stock_Items.csv");
      formData.append("hasHeader", "true");
    }
    UploadStockItems(formData).then(
      () => {
        showSnackbar({
          isLowContrast: true,
          title: t("rejectOrder", "Uploaded Order"),
          kind: "success",
          subtitle: t(
            "SuccessfullyUploadedStockItem",
            `You have successfully uploaded stock items`
          ),
        });
        closeModal();
      },
      (err) => {
        showSnackbar({
          title: t(
            "errorUploadingItems",
            "An error occurred uploading stock items"
          ),
          kind: "error",
          isLowContrast: true,
          subtitle: err?.message,
        });
      }
    );
  };

  const onFileChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event?.target?.files?.[0];
    if (file && file.size <= 2 * 1024 * 1024) {
      setSelectedFile(file);
    } else {
      setSelectedFile(null);
      event.target.value = "";
      showSnackbar({
        title: t("fileSizeError", "File size error"),
        kind: "error",
        isLowContrast: true,
        subtitle: t("fileSizeErrorMessage", "File size must be 2MB or less"),
      });
    }
  };

  return (
    <div>
      <Form>
        <ModalHeader
          closeModal={closeModal}
          title={t("importStockItems", "Import Stock Items")}
        />
        <ModalBody>
          <FileUploader
            accept={[".csv"]}
            multiple={false}
            name={"file"}
            buttonLabel="Select file"
            labelDescription="Only .csv files at 2mb or less"
            filenameStatus="edit"
            labelTitle=""
            size="sm"
            onChange={onFileChanged}
          />
        </ModalBody>
        <ModalFooter>
          <Button kind="secondary" onClick={closeModal}>
            {t("cancel", "Cancel")}
          </Button>
          <Button type="button" onClick={onConfirmUpload}>
            {t("uploadStockItems", "Upload StockItems")}
          </Button>
        </ModalFooter>
      </Form>
    </div>
  );
};

export default ImportDialogPopup;
