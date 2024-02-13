import { Dropdown, Modal, ModalBody } from "@carbon/react";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

interface DropdownItem {
  id: string;
  text: string;
}

interface AdvancedFiltersProps {
  config: {
    header: string;
    type: boolean;
    status: boolean;
    date: boolean;
    operationTypes: string[];
    statuses: string[];
    onApplyFilter: (newFilters: { type?: string; status?: string }) => void;
  };
  closeModal: () => void;
}

const AdvancedFiltersMenuModal: React.FC<AdvancedFiltersProps> = ({
  config,
  closeModal,
}) => {
  const { t } = useTranslation();

  const [selectedType, setSelectedType] = useState<DropdownItem | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<DropdownItem | null>(
    null
  );

  const typeDropdownItems = config.operationTypes.map((type) => ({
    id: type,
    text: type,
  }));
  const statusDropdownItems = config.statuses.map((status) => ({
    id: status,
    text: status,
  }));

  const handleApplyClick = () => {
    config.onApplyFilter({
      type: selectedType ? selectedType.text : undefined,
      status: selectedStatus ? selectedStatus.text : undefined,
    });
    closeModal();
  };

  return (
    <Modal
      open={true}
      modalHeading={config.header}
      primaryButtonText={t("apply", "Apply")}
      secondaryButtonText={t("cancel", "Cancel")}
      onRequestSubmit={handleApplyClick}
      onRequestClose={closeModal}
    >
      <ModalBody>
        {config.type && (
          <Dropdown
            id="filterByType"
            items={typeDropdownItems}
            initialSelectedItem={typeDropdownItems[0]}
            itemToString={(item) => (item ? item.text : "")}
            titleText={t("chooseOption", "Choose an Option")}
            onChange={({ selectedItem }) =>
              setSelectedType(selectedItem || null)
            }
          />
        )}
        {config.status && (
          <Dropdown
            id="filterByStatus"
            items={statusDropdownItems}
            initialSelectedItem={statusDropdownItems[0]}
            itemToString={(item) => (item ? item.text : "")}
            titleText={t("chooseOption", "Choose an Option")}
            onChange={({ selectedItem }) =>
              setSelectedStatus(selectedItem || null)
            }
          />
        )}
      </ModalBody>
    </Modal>
  );
};

export default AdvancedFiltersMenuModal;
