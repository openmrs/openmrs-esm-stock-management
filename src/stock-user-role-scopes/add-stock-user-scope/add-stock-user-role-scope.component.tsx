import {
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Form,
  TextInput,
  Checkbox,
  DropdownSkeleton,
  CheckboxGroup,
} from "@carbon/react";
import React, { useState } from "react";
import styles from "./add-stock-user-role-scope.scss";
import {
  LocationFilterCriteria,
  useStockLocations,
  useStockOperationTypes,
} from "../../stock-lookups/stock-lookups.resource";
import { ResourceRepresentation } from "../../core/api/api";

const AddStockUserRoleScope: React.FC = () => {
  // get stock sources
  // operation types
  const {
    types: { results: stockOperations },
    isLoading,
    isError,
  } = useStockOperationTypes();

  //locations
  const {
    locations: { results: locations },
    isLoadingLocations,
    isErrorLocation,
  } = useStockLocations({ v: ResourceRepresentation.Default });

  if (isLoading || isError) {
    return <DropdownSkeleton />;
  }

  return (
    <div>
      <Form>
        <ModalHeader />
        <ModalBody>
          <section className={styles.section}>
            <TextInput
              id="userName"
              type="text"
              labelText="User"
              size="md"
              placeholder="Filter"
            />
          </section>
          <section className={styles.section}>
            <TextInput
              id="userRole"
              type="text"
              labelText="Role"
              size="md"
              placeholder="Choose a role"
            />
          </section>
          <section className={styles.section}>
            <Checkbox labelText={`Enabled`} id="userEnabled" />
            <Checkbox labelText={`Permanent`} id="userPermanent" />
          </section>

          <section className={styles.section}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span> Stock Operations</span>
              <span>
                The role will be applicable to only selected stock operations.
              </span>
            </div>
          </section>
          <section className={styles.section}>
            {stockOperations.length > 0 &&
              stockOperations.map((type) => {
                return (
                  <div style={{ display: "flex", flexDirection: "row" }}>
                    <Checkbox labelText={type.name} id="operationType" />
                  </div>
                );
              })}
          </section>
          <section className={styles.section}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span> Locations</span>
              <span>
                Use the toggle to apply this scope to the locations under the
                selected location.
              </span>
            </div>
          </section>
          <CheckboxGroup className={styles.section}>
            {locations?.length > 0 &&
              locations.map((type) => {
                return <Checkbox labelText={type.name} id="locations" />;
              })}
          </CheckboxGroup>
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
