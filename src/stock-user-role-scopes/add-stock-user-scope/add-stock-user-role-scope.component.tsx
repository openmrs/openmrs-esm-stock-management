import { StockSource } from "../../core/api/types/stockOperation/StockSource";
import {
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Form,
  TextInput,
} from "@carbon/react";
import React from "react";
import styles from "./add-stock-user-role-scope.scss";
import { useConceptById } from "../../stock-lookups/stock-lookups.resource";
import { STOCK_SOURCE_TYPE_CODED_CONCEPT_ID } from "../../constants";

interface StockSourcesAddOrCreateDialogProps {
  title: string;
  source: StockSource;
  closeModal: () => void;
}

const AddStockUserRoleScope: React.FC = () => {
  // get stock sources
  const { items, isLoading, isError } = useConceptById(
    STOCK_SOURCE_TYPE_CODED_CONCEPT_ID
  );

  return (
    <div>
      <Form>
        <ModalHeader />
        <ModalBody>
          <section className={styles.section}>
            <TextInput
              id="fullname"
              type="text"
              labelText="FullName"
              size="md"
              placeholder="e.g National Medical Stores"
            />
          </section>
          <section className={styles.section}>
            <TextInput
              id="acronym"
              type="text"
              size="md"
              placeholder="e.g NMS"
              labelText="Acronym/Code"
            />
          </section>
          <section className={styles.section}>
            <TextInput
              id="sourceType"
              type="text"
              size="md"
              labelText="Source type"
            />
          </section>
        </ModalBody>
        <ModalFooter>
          <Button kind="secondary">Cancel</Button>
          <Button type="submit">Save</Button>
        </ModalFooter>
      </Form>
    </div>
  );
};

export default AddStockUserRoleScope;
