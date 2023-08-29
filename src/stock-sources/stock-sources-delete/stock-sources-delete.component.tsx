import React from "react";
import { Button, Form, ModalFooter, ModalHeader } from "@carbon/react";

const StockSourcesDelete: React.FC = () => {
  return (
    <div>
      <Form>
        <ModalHeader />
        <ModalFooter>
          <Button kind="secondary">Cancel</Button>
          <Button kind="danger" type="submit">
            Delete
          </Button>
        </ModalFooter>
      </Form>
    </div>
  );
};

export default StockSourcesDelete;
