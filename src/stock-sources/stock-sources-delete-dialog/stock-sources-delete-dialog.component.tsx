import React from "react";
import { StockSource } from "../../core/api/types/stockOperation/StockSource";
import {
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  Button,
} from "@carbon/react";

interface StockSourcesDeleteDialogProps {
  source: StockSource;
  closeModal: () => void;
}

const StockSourcesDelete: React.FC<StockSourcesDeleteDialogProps> = ({
  source,
  closeModal,
}) => {
  return (
    <div>
      <Form>
        <ModalHeader closeModal={closeModal} title={`Delete ${source.name}`} />
        <ModalFooter>
          <Button kind="secondary" onClick={closeModal}>
            Cancel
          </Button>
          <Button kind="danger" type="submit">
            Delete
          </Button>
        </ModalFooter>
      </Form>
    </div>
  );
};

export default StockSourcesDelete;
