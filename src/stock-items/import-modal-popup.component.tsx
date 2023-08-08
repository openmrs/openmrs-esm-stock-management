import { FileUploader, FormGroup, Modal, RadioButton, RadioButtonGroup, RadioButtonValue } from 'carbon-components-react';
import React, { ChangeEvent, useEffect, useState } from 'react';
import { Splash } from '../components/spinner/Splash';
import { URL_IMPORT_ERROR_FILE, URL_IMPORT_TEMPLATE_FILE } from '../constants';
import { useImportStockItemMutation } from '../core/api/stockItem';
import { errorAlert, successAlert } from '../core/utils/alert';
import useTranslation from '../core/utils/translation';

export interface ImportModalPopupProps {
  onClose: (refresh: boolean) => void;
  onConfirm: () => void;
  showModal: boolean;
}

export const ImportModalPopup: React.FC<ImportModalPopupProps> = ({
  onClose,
  onConfirm,
  showModal
}) => {
  const { t } = useTranslation();
  const [selectedFile, setSelectedFile] = useState<any>();
  const [openModal, setOpenModal] = useState(false);
  const [hasHeader, setHasHeader] = useState(true);
  const [fileNotSelected, setFileNotSelected] = useState(true);
  const [importStockItems, { data: importResult, isLoading: importingStockItems }] = useImportStockItemMutation();
  const [displayErrors, setDisplayErrors] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let fileUploader: FileUploader | null;

  useEffect(() => {
    setOpenModal(showModal);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (importResult) {
      if (importResult.success) {
        successAlert(t("stockmanagement.stockitem.import.success"));
        onClose?.(true);
      } else {
        errorAlert(t("stockmanagement.stockitem.import.failed"));
        setDisplayErrors(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [importResult]);

  const onConfirmUpload = () => {
    if (!selectedFile) {
      return;
    }
    setDisplayErrors(false);
    let formData = new FormData();
    formData.set("file", selectedFile);
    formData.set("hasHeader", hasHeader ? "true" : "false");
    importStockItems(formData);
  }

  function onCancel() {
    onClose?.(false);
  }

  const onHasHeaderChanged = (selection: RadioButtonValue, name: string, evt: ChangeEvent<HTMLInputElement>) => {
    setHasHeader(selection === "true")
  }

  const onFileChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDisplayErrors(false);
    let file = event?.target?.files?.[0]
    if (file) {
      setSelectedFile(file);
      setFileNotSelected(false);
    }
    else {
      event.preventDefault();
    }
  }

  const onFileDeleted = (event: React.MouseEvent<HTMLElement>) => {
    setFileNotSelected(true);
  }

  return <>
    <Splash active={importingStockItems} blockUi={true} />
    {!importingStockItems &&
      <Modal size='sm' open={openModal} className="stkpg-import" primaryButtonText={t("stockmanagement.import")}
        secondaryButtonText={t("stockmanagement.cancel")}
        primaryButtonDisabled={fileNotSelected}
        modalLabel={""}
        modalHeading={"Import Stock Items"}
        onRequestClose={onCancel}
        shouldSubmitOnEnter={false}
        onRequestSubmit={onConfirmUpload}
        onSecondarySubmit={onCancel}>
        {displayErrors && <div>
          <div className='stkpkg-upload-state'>
            Stock items created: <b>{importResult?.createdCount}</b> Updated: <b>{importResult?.updatedCount}</b> Not Changed: <b>{importResult?.notChangedCount}</b>
          </div>
          <div className='error-text'>
            {importResult?.errors && <>
              <ul>
                {importResult?.errors.map(p => <li>{p}</li>)}
              </ul>
            </>
            }
            {importResult?.hasErrorFile && importResult.uploadSessionId && <div>
              Click <a rel="noreferrer" href={URL_IMPORT_ERROR_FILE(importResult.uploadSessionId)} target={"_blank"}>here</a> to access the error log file.
            </div>
            }
          </div>
        </div>
        }
        <FileUploader accept={['.csv']} multiple={false} name={"file"}
          buttonLabel="Select file"
          labelDescription="Only .csv files at 2mb or less"
          filenameStatus='edit'
          labelTitle="" size='small'
          ref={node => (fileUploader = node)}
          onChange={onFileChanged}
          onDelete={onFileDeleted}
        />
        <FormGroup className='clear-margin-bottom' legendText={t("stockmanagement.stockitem.edit.hasheader")} title={t("stockmanagement.stockitem.edit.hasheader")}>
          <RadioButtonGroup name="hasHeader"
            defaultSelected={"true"}
            legendText="" onChange={onHasHeaderChanged}  >
            <RadioButton value="true" id="hasHeader-true" labelText={t("stockmanagement.yes")} />
            <RadioButton value="false" id="hasHeader-false" labelText={t("stockmanagement.no")} />
          </RadioButtonGroup>
        </FormGroup>
        <div className='stpkg-import-template'>
          Download <a rel="noreferrer" href={URL_IMPORT_TEMPLATE_FILE} target={"_blank"}>template</a>
        </div>
      </Modal>
    }
  </>
}