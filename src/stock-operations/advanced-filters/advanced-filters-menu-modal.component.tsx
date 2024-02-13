import { Dropdown, Modal, ModalBody } from "@carbon/react";
import React from "react";
import { useTranslation } from "react-i18next";

interface AdvancedFiltersProps {
  config: {
    header: string;
    type: boolean;
    status: boolean;
    date: boolean;
  };
  closeModal: () => void;
}

const AdvancedFiltersMenuModal: React.FC<AdvancedFiltersProps> = ({
  config,
  closeModal,
}) => {
  const { t } = useTranslation();
  return (
    <Modal
      open={true}
      modalHeading={config.header}
      primaryButtonText={t("apply", "Apply")}
      secondaryButtonText={t("cancel", "Cancel")}
      onRequestSubmit={() => {
        closeModal();
      }}
      onRequestClose={closeModal}
    >
      <ModalBody>
        <div>
          {config.type && (
            <div>
              <Dropdown
                id="filterByType"
                itemToString={(item) => (item ? item.text : "")}
                titleText={t("chooseOption", "Choose an Option")}
              />
            </div>
          )}
          {config.status && (
            <div>
              <Dropdown
                id="filterByStatus"
                itemToString={(item) => (item ? item.text : "")}
                titleText={t("chooseOption", "Choose an Option")}
              />
            </div>
          )}
          {config.date && (
            <div>
              <h5>Filter by Date</h5>
            </div>
          )}
        </div>
      </ModalBody>
    </Modal>
  );
};

export default AdvancedFiltersMenuModal;
