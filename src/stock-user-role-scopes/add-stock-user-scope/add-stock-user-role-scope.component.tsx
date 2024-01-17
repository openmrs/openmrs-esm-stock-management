import {
  Button,
  Checkbox,
  CheckboxGroup,
  Form,
  ModalBody,
  ModalFooter,
  ModalHeader,
  InlineLoading,
  Toggle,
  DatePickerInput,
  DatePicker,
  ComboBox,
} from "@carbon/react";
import React, { ChangeEvent, useMemo, useState } from "react";
import styles from "./add-stock-user-role-scope.scss";
import {
  UserFilterCriteria,
  useRoles,
  useStockLocations,
  useStockOperationTypes,
  useUser,
  useUsers,
} from "../../stock-lookups/stock-lookups.resource";
import { ResourceRepresentation } from "../../core/api/api";
import { closeOverlay } from "../../core/components/overlay/hook";
import { useTranslation } from "react-i18next";
import { UserRoleScope } from "../../core/api/types/identity/UserRoleScope";
import { createOrUpdateUserRoleScope } from "../stock-user-role-scopes.resource";
import { showNotification, showToast } from "@openmrs/esm-framework";
import { UserRoleScopeOperationType } from "../../core/api/types/identity/UserRoleScopeOperationType";
import { UserRoleScopeLocation } from "../../core/api/types/identity/UserRoleScopeLocation";
import { OpenMRSLocation } from "../../core/api/types/Location";
import {
  DATE_PICKER_CONTROL_FORMAT,
  DATE_PICKER_FORMAT,
  formatForDatePicker,
  today,
} from "../../constants";
import { debounce } from "lodash-es";
import { User } from "../../core/api/types/identity/User";
import { Role } from "../../core/api/types/identity/Role";
import { StockOperationType } from "../../core/api/types/stockOperation/StockOperationType";
import { handleMutate } from "../swr-revalidation";

const MinDate: Date = today();

interface AddStockUserRoleScopeProps {
  model?: UserRoleScope;
}

const AddStockUserRoleScope: React.FC<AddStockUserRoleScopeProps> = ({
  model,
}) => {
  const { t } = useTranslation();

  const [formModel, setFormModel] = useState<UserRoleScope>({ ...model });

  const [roles, setRoles] = useState<Role[]>([]);

  const { data: user } = useUser(model?.uuid);

  // operation types
  const {
    types: { results: stockOperations },
    isLoading,
    isError,
  } = useStockOperationTypes();

  // get users
  const {
    items: users,
    isError: error,
    isLoading: loadingUsers,
  } = useUsers({ v: ResourceRepresentation.Default });

  // get roles
  const {
    items: rolesData,
    isError: rolesError,
    isLoading: loadingRoles,
  } = useRoles({ v: ResourceRepresentation.Default });

  //locations
  const {
    locations: { results: locations },
  } = useStockLocations({ v: ResourceRepresentation.Default });

  const onEnabledChanged = (
    cvt: React.ChangeEvent<HTMLInputElement>,
    data: { checked: boolean; id: string }
  ): void => {
    const isEnabled = !formModel?.enabled;
    setFormModel({ ...formModel, enabled: isEnabled });
  };

  const onPermanentChanged = (
    cvt: React.ChangeEvent<HTMLInputElement>,
    data: { checked: boolean; id: string }
  ): void => {
    const isPermanent = !formModel?.permanent;
    setFormModel({
      ...formModel,
      permanent: isPermanent,
      activeFrom: undefined,
      activeTo: undefined,
    });
  };

  const onStockOperationTypeChanged = (
    event: React.ChangeEvent<HTMLInputElement>,
    uuid: string,
    isChecked: boolean
  ): void => {
    const operationType = formModel?.operationTypes?.find(
      (x) => x.operationTypeUuid === event?.target?.value
    );
    if (operationType) {
      const newOperationTypes = [
        ...formModel.operationTypes.filter(
          (x) => x.operationTypeUuid !== operationType?.operationTypeUuid
        ),
      ];
      setFormModel({ ...formModel, operationTypes: newOperationTypes });
    } else {
      const stockOperationType = stockOperations?.find(
        (x) => x.uuid === event?.target?.value
      );
      const operationType: UserRoleScopeOperationType = {
        operationTypeName: stockOperationType?.name,
        operationTypeUuid: stockOperationType?.uuid,
      } as unknown as UserRoleScopeOperationType;
      setFormModel({
        ...formModel,
        operationTypes: [...(formModel?.operationTypes ?? []), operationType],
      });
    }
  };

  const onLocationCheckBoxChanged = (
    event: ChangeEvent<HTMLInputElement>,
    id: string
  ): void => {
    const selectedLocation = formModel?.locations?.find(
      (x) => x.locationUuid === event?.target?.value
    );
    if (selectedLocation) {
      const newLocations = [
        ...(formModel?.locations?.filter(
          (x) => x.locationUuid !== selectedLocation?.locationUuid
        ) ?? []),
      ];
      setFormModel({ ...formModel, locations: newLocations });
    } else {
      const loc = locations?.find((x) => x.uuid === event?.target?.value);
      const newLocation: UserRoleScopeLocation = {
        locationName: loc?.display,
        locationUuid: loc?.uuid,
        enableDescendants: false,
      } as unknown as UserRoleScopeLocation;
      const newLocations = [...(formModel?.locations ?? []), newLocation];
      setFormModel({ ...formModel, locations: newLocations });
    }
  };

  const findCheckedLocation = (
    location: OpenMRSLocation
  ): UserRoleScopeLocation | null => {
    const result = formModel?.locations?.filter(
      (x) => x.locationUuid === location.uuid
    );
    return result && result.length > 0 ? result[0] : null;
  };

  const onActiveDatesChange = (dates: Date[]): void => {
    setFormModel({ ...formModel, activeFrom: dates[0], activeTo: dates[1] });
  };
  const handleUsersSearch = useMemo(
    () =>
      debounce((searchTerm) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useUsers({
          v: ResourceRepresentation.Default,
          q: searchTerm,
        } as any as UserFilterCriteria);
      }, 300),
    []
  );

  const onUserChanged = (data: { selectedItem: User }) => {
    setFormModel({ ...formModel, userUuid: data.selectedItem?.uuid });
    setRoles(data.selectedItem?.roles ?? []);

    console.info(roles);
  };

  const onRoleChange = (data: { selectedItem: Role }) => {
    const rootLocations = locations?.map((x) => x.uuid);
    const filteredLocations =
      formModel?.locations?.filter(
        (x) =>
          !rootLocations ||
          rootLocations.length === 0 ||
          !rootLocations.some((p) => p === x.locationUuid)
      ) ?? [];

    setFormModel({
      ...formModel,
      role: data.selectedItem?.display,
      locations: [...filteredLocations],
    });
  };

  const onEnableDescendantsChanged = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedLocation = formModel?.locations?.find(
      (x) => x.locationUuid === event?.target?.value
    );
    if (selectedLocation) {
      const enableDescendants = !(selectedLocation.enableDescendants === true);
      const newModifiedLocation = {
        ...selectedLocation,
        enableDescendants: enableDescendants,
      };
      setFormModel({
        ...formModel,
        locations: [
          ...(formModel?.locations?.filter(
            (x) => x.locationUuid !== selectedLocation?.locationUuid
          ) ?? []),
          newModifiedLocation,
        ],
      });
    }
  };

  const isOperationChecked = (operationType: StockOperationType) => {
    return (
      formModel?.operationTypes?.filter(
        (x) => x.operationTypeUuid === operationType.uuid
      )?.length > 0
    );
  };

  const addStockUserRole = async (e) => {
    e.preventDefault();

    // console.info(formModel);

    createOrUpdateUserRoleScope(formModel).then(
      (res) => {
        handleMutate("ws/rest/v1/stockmanagement/userrolescope");
        showToast({
          critical: true,
          title: t("addUserRole", "Add User role"),
          kind: "success",
          description: t(
            "successfullysaved",
            `You have successfully saved user role scope `
          ),
        });
        closeOverlay();
      },
      (err) => {
        showNotification({
          title: t(
            `errorSaving user role scope', 'Error Saving user role scope`
          ),
          kind: "error",
          critical: true,
          description: err?.message,
        });

        closeOverlay();
      }
    );
  };

  if (isLoading || loadingRoles || loadingUsers) {
    return (
      <InlineLoading
        status="active"
        iconDescription="Loading"
        description="Loading data..."
      />
    );
  }

  return (
    <div>
      <Form>
        <ModalHeader />
        <ModalBody>
          <section className={styles.section}>
            <div>
              {users?.results?.length > 0 && (
                <>
                  <span className={styles.subTitle}>User</span>
                  <ComboBox
                    id="userName"
                    size="md"
                    labelText="User"
                    value={
                      formModel.userUuid
                        ? `${formModel.userFamilyName} ${formModel.userGivenName}`
                        : ``
                    }
                    items={users?.results}
                    onChange={onUserChanged}
                    shouldFilterItem={(data) => true}
                    onFocus={() => users?.results || handleUsersSearch("")}
                    onToggleClick={() =>
                      users?.results || handleUsersSearch("")
                    }
                    itemToString={(item) =>
                      `${item?.person?.display ?? item?.display ?? ""}`
                    }
                    placeholder="Filter..."
                  />
                </>
              )}
            </div>
          </section>
          <section className={styles.section}>
            <div>
              {rolesData?.results?.length > 0 && (
                <>
                  <span className={styles.subTitle}> Role </span>
                  <ComboBox
                    id="userRole"
                    type="text"
                    labelText="Role"
                    size="md"
                    onChange={onRoleChange}
                    value={formModel?.role ?? ""}
                    items={rolesData?.results ?? roles}
                    shouldFilterItem={() => true}
                    onFocus={() => rolesData?.results}
                    onToggleClick={() => rolesData?.results}
                    itemToString={(item) => (item ? item?.display : "")}
                    placeholder="Choose a role"
                  />
                </>
              )}
            </div>
          </section>
          <section className={styles.section}>
            <CheckboxGroup className={styles.checkboxGrid}>
              <Checkbox
                onChange={onEnabledChanged}
                checked={formModel?.enabled}
                labelText={`Enabled ?`}
                value={model?.enabled}
                id="chk-userEnabled"
              />
              <Checkbox
                onChange={onPermanentChanged}
                name="isPermanent"
                checked={formModel?.permanent}
                value={model?.permanent}
                labelText={`Permanent ?`}
                id="chk-userPermanent"
              />

              {!formModel?.permanent && (
                <>
                  <DatePicker
                    datePickerType="range"
                    light
                    minDate={formatForDatePicker(MinDate)}
                    locale="en"
                    dateFormat={DATE_PICKER_CONTROL_FORMAT}
                    onChange={onActiveDatesChange}
                  >
                    <DatePickerInput
                      id="date-picker-input-id-start"
                      name="activeFrom"
                      placeholder={DATE_PICKER_FORMAT}
                      labelText={t("activeFrom", "Active From")}
                      value={formatForDatePicker(formModel?.activeFrom)}
                    />
                    <DatePickerInput
                      id="date-picker-input-id-finish"
                      name="activeTo"
                      placeholder={DATE_PICKER_FORMAT}
                      labelText={t("activeTo", "Active To")}
                      value={formatForDatePicker(formModel?.activeTo)}
                    />
                  </DatePicker>
                </>
              )}
            </CheckboxGroup>
          </section>
          <br />
          <section className={styles.section}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span className={styles.sectionTitle}> Stock Operations</span>
              <div className={styles.hr} />
              <span className={styles.subTitle}>
                The role will be applicable to only selected stock operations.
              </span>
            </div>
          </section>
          <section className={styles.section}>
            <CheckboxGroup className={styles.checkboxGrid}>
              {stockOperations.length > 0 &&
                stockOperations.map((type) => {
                  return (
                    <div style={{ display: "flex", flexDirection: "row" }}>
                      <Checkbox
                        value={type.uuid}
                        checked={isOperationChecked(type)}
                        onChange={(event) =>
                          onStockOperationTypeChanged(
                            event,
                            type.uuid,
                            isOperationChecked(type)
                          )
                        }
                        className={styles.checkbox}
                        labelText={type.name}
                        id={type.uuid}
                      />
                    </div>
                  );
                })}
            </CheckboxGroup>
          </section>
          <br />
          <section className={styles.section}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span className={styles.sectionTitle}> Locations</span>
              <div className={styles.hr} />
              <span className={styles.subTitle}>
                Use the toggle to apply this scope to the locations under the
                selected location.
              </span>
            </div>
          </section>
          <section className={styles.section}>
            <CheckboxGroup className={styles.checkboxGrid}>
              {locations?.length > 0 &&
                locations.map((type) => {
                  const checkedLocation = findCheckedLocation(type);

                  const getToggledValue = (locationUuid) => {
                    const location =
                      checkedLocation?.locationUuid === locationUuid
                        ? checkedLocation
                        : null;
                    return location?.enableDescendants === true;
                  };

                  return (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        margin: "4px",
                        padding: "5px",
                      }}
                    >
                      <Checkbox
                        name="location"
                        key={`chk-loc-child-key-${type.uuid}`}
                        id={`chk-loc-child-${type.uuid}`}
                        value={type.uuid}
                        onChange={(event) =>
                          onLocationCheckBoxChanged(event, type.uuid)
                        }
                        className={styles.checkbox}
                        labelText={type.name}
                        checked={checkedLocation != null}
                      />
                      {checkedLocation && (
                        <Toggle
                          value={type.uuid}
                          hideLabel
                          className={styles.toggle}
                          size={"sm"}
                          onToggleClick={getToggledValue(type.uuid)}
                          key={`tg-loc-child-key-${type.uuid}`}
                          id={`tg-loc-child-${type.uuid}`}
                        />
                      )}
                    </div>
                  );
                })}
            </CheckboxGroup>
          </section>
        </ModalBody>
        <ModalFooter>
          <Button kind="secondary" onClick={closeOverlay}>
            {t("cancel", "Cancel")}
          </Button>
          <Button type="submit" onClick={addStockUserRole}>
            {t("save", "Save")}
          </Button>
        </ModalFooter>
      </Form>
    </div>
  );
};

export default AddStockUserRoleScope;
