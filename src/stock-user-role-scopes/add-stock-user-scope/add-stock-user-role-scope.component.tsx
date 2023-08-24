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
  Select,
  SelectItem,
} from "@carbon/react";
import React, { useState } from "react";
import styles from "./add-stock-user-role-scope.scss";
import {
  LocationFilterCriteria,
  useRoles,
  useStockLocations,
  useStockOperationTypes,
  useUsers,
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

  // users
  const {
    items: { results: users },
    isLoading: isLoadingUsers,
    isError: isErrorUsers,
  } = useUsers({});

  // roles
  const {
    items: { results: roles },
    isLoading: isLoadingRoles,
    isError: isErrorRoles,
  } = useRoles({});

  if (isLoading || isError) {
    return <DropdownSkeleton />;
  }

  return (
    <div>
      <Form>
        <ModalHeader />
        <ModalBody>
          <section className={styles.section}>
            <Select
              name="users"
              className="select-field"
              labelText={"User"}
              id="user"
            >
              <SelectItem
                disabled
                hidden
                value="placeholder-item"
                text="Choose a user"
              />
              {users?.map((sourceType) => {
                return (
                  <SelectItem
                    key={sourceType.uuid}
                    value={sourceType.uuid}
                    text={sourceType.display}
                  />
                );
              })}
            </Select>
            {/* <TextInput
              id="userName"
              type="text"
              labelText="User"
              size="md"
              placeholder="Filter"
            /> */}
          </section>
          <section className={styles.section}>
            <Select
              name="roles"
              className="select-field"
              labelText={"Role"}
              id="userRole"
              size="md"
            >
              <SelectItem
                disabled
                hidden
                value="placeholder-item"
                text="Choose a role"
              />
              {roles?.map((sourceType) => {
                return (
                  <SelectItem
                    key={sourceType.role}
                    value={sourceType.role}
                    text={sourceType.display}
                  />
                );
              })}
            </Select>
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
            {stockOperations.length > 0 && (
              <CheckboxGroup
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                }}
              >
                {stockOperations.map((type) => {
                  return <Checkbox labelText={type.name} id="operationType" />;
                })}
              </CheckboxGroup>
            )}
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
          <CheckboxGroup
            className={styles.section}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
            }}
          >
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
