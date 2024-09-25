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
  Select,
  SelectItem,
} from '@carbon/react';
import React, { ChangeEvent, useEffect, useState } from 'react';
import styles from './add-stock-user-role-scope.scss';
import {
  useRoles,
  useStockOperationTypes,
  useStockTagLocations,
  useUser,
  useUsers,
} from '../../stock-lookups/stock-lookups.resource';
import { ResourceRepresentation } from '../../core/api/api';
import { closeOverlay } from '../../core/components/overlay/hook';
import { useTranslation } from 'react-i18next';
import { UserRoleScope } from '../../core/api/types/identity/UserRoleScope';
import { createOrUpdateUserRoleScope } from '../stock-user-role-scopes.resource';
import { restBaseUrl, showSnackbar, useSession } from '@openmrs/esm-framework';
import { UserRoleScopeOperationType } from '../../core/api/types/identity/UserRoleScopeOperationType';
import { UserRoleScopeLocation } from '../../core/api/types/identity/UserRoleScopeLocation';
import {
  DATE_PICKER_CONTROL_FORMAT,
  DATE_PICKER_FORMAT,
  INVENTORY_ADMNISTRATOR_ROLE_UUID,
  INVENTORY_CLERK_ROLE_UUID,
  INVENTORY_DISPENSING_ROLE_UUID,
  INVENTORY_MANAGER_ROLE_UUID,
  INVENTORY_REPORTING_ROLE_UUID,
  formatForDatePicker,
  today,
} from '../../constants';
import { User } from '../../core/api/types/identity/User';
import { Role } from '../../core/api/types/identity/Role';
import { StockOperationType } from '../../core/api/types/stockOperation/StockOperationType';
import { handleMutate } from '../../utils';

const MinDate: Date = today();

interface AddStockUserRoleScopeProps {
  model?: UserRoleScope;
  editMode?: boolean;
}

const AddStockUserRoleScope: React.FC<AddStockUserRoleScopeProps> = ({ model, editMode }) => {
  const { t } = useTranslation();
  const currentUser = useSession();
  const [formModel, setFormModel] = useState<UserRoleScope>({ ...model });

  const [roles, setRoles] = useState<Role[]>([]);

  const loggedInUserUuid = currentUser?.user?.uuid;

  // operation types
  const {
    types: { results: stockOperations },
    isLoading,
  } = useStockOperationTypes();

  // get users
  const { items: users, isLoading: loadingUsers } = useUsers({
    v: ResourceRepresentation.Default,
  });

  const [selectedUserUuid, setSelectedUserUuid] = useState<string | null>(null);
  const { data: user } = useUser(selectedUserUuid);

  // get roles
  const { isLoading: loadingRoles } = useRoles({
    v: ResourceRepresentation.Default,
  });

  /* Only load locations tagged to perform stock related activities.
     Unless a location is tag as main store, main pharmacy or dispensing, it will not be listed here.
   */
  const { stockLocations } = useStockTagLocations();
  const onEnabledChanged = (): void => {
    const isEnabled = !formModel?.enabled;
    setFormModel({ ...formModel, enabled: isEnabled });
  };

  const onPermanentChanged = (): void => {
    const isPermanent = !formModel?.permanent;
    setFormModel({
      ...formModel,
      permanent: isPermanent,
      activeFrom: undefined,
      activeTo: undefined,
    });
  };

  const [filteredItems, setFilteredItems] = useState<unknown[]>([]);

  const usersResults = users?.results ?? [];

  const filterItems = (query: string) => {
    if (query && query.trim() !== '') {
      const filtered = usersResults
        .filter((item: any) => item.uuid !== loggedInUserUuid)
        .filter((item: any) => {
          const displayName = item?.person?.display ?? item?.display ?? '';
          return displayName?.toLowerCase().includes(query?.toLowerCase());
        });
      setFilteredItems(filtered);
    }
  };
  useEffect(() => {
    if (model?.userUuid) {
      setSelectedUserUuid(model.userUuid);
    }
  }, [model]);

  const handleSearchQueryChange = (query: string) => {
    filterItems(query);
  };
  const onStockOperationTypeChanged = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const operationType = formModel?.operationTypes?.find((x) => x.operationTypeUuid === event?.target?.value);
    if (operationType) {
      const newOperationTypes = [
        ...formModel.operationTypes.filter((x) => x.operationTypeUuid !== operationType?.operationTypeUuid),
      ];
      setFormModel({ ...formModel, operationTypes: newOperationTypes });
    } else {
      const stockOperationType = stockOperations?.find((x) => x.uuid === event?.target?.value);
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

  const onLocationCheckBoxChanged = (event: ChangeEvent<HTMLInputElement>): void => {
    const selectedLocation = formModel?.locations?.find((x) => x.locationUuid === event?.target?.value);
    if (selectedLocation) {
      const newLocations = [
        ...(formModel?.locations?.filter((x) => x.locationUuid !== selectedLocation?.locationUuid) ?? []),
      ];
      setFormModel({ ...formModel, locations: newLocations });
    } else {
      const loc = stockLocations?.find((x) => x.id === event?.target?.value);
      const newLocation: UserRoleScopeLocation = {
        locationName: loc?.name,
        locationUuid: loc?.id,
        enableDescendants: false,
      } as unknown as UserRoleScopeLocation;
      const newLocations = [...(formModel?.locations ?? []), newLocation];
      setFormModel({ ...formModel, locations: newLocations });
    }
  };

  const findCheckedLocation = (location: fhir.Location): UserRoleScopeLocation | null => {
    const result = formModel?.locations?.filter((x) => x.locationUuid === location.id);
    return result && result.length > 0 ? result[0] : null;
  };

  const onActiveDatesChange = (dates: Date[]): void => {
    setFormModel({ ...formModel, activeFrom: dates[0], activeTo: dates[1] });
  };

  const onUserChanged = (data: { selectedItem: User }) => {
    const stockRolesUUIDs = [
      INVENTORY_CLERK_ROLE_UUID,
      INVENTORY_MANAGER_ROLE_UUID,
      INVENTORY_DISPENSING_ROLE_UUID,
      INVENTORY_REPORTING_ROLE_UUID,
      INVENTORY_ADMNISTRATOR_ROLE_UUID,
    ];

    const filteredStockRoles = data.selectedItem?.roles
      .filter((role) => stockRolesUUIDs.includes(role.uuid))
      .filter((role) => role.uuid !== loggedInUserUuid);
    setFormModel({ ...formModel, userUuid: data.selectedItem?.uuid });
    setRoles(filteredStockRoles ?? []);
    setSelectedUserUuid(data?.selectedItem?.uuid);
  };

  const onRoleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const rootLocations = stockLocations?.filter((x) => !x.id)?.map((x) => x.id);
    const filteredLocations =
      formModel?.locations?.filter(
        (x) => !rootLocations || rootLocations.length === 0 || !rootLocations.some((p) => p === x.locationUuid),
      ) ?? [];

    setFormModel({
      ...formModel,
      role: e.target.value,
      locations: filteredLocations,
    });
  };

  const isOperationChecked = (operationType: StockOperationType) => {
    return formModel?.operationTypes?.filter((x) => x.operationTypeUuid === operationType.uuid)?.length > 0;
  };

  const addStockUserRole = async (e) => {
    e.preventDefault();

    createOrUpdateUserRoleScope(formModel).then(
      () => {
        handleMutate(`${restBaseUrl}/stockmanagement/userrolescope`);
        showSnackbar({
          isLowContrast: true,
          title: t('addUserRole', 'Add User role'),
          kind: 'success',
          subtitle: t('successfullysaved', 'You have successfully saved user role scope'),
        });
        closeOverlay();
      },
      (err) => {
        showSnackbar({
          title: t('errorSavingUserRoleScope', 'Error Saving user role scope'),
          kind: 'error',
          isLowContrast: true,
          subtitle: err?.message,
        });

        closeOverlay();
      },
    );
  };
  if (isLoading || loadingRoles || loadingUsers) {
    return (
      <InlineLoading status="active" iconDescription="Loading" description={t('loadingData', 'Loading data...')} />
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
                  <span className={styles.subTitle}>{t('user', 'User')}</span>
                  <ComboBox
                    id="userName"
                    size="md"
                    labelText={t('user', 'User')}
                    items={filteredItems.length ? filteredItems : usersResults}
                    onChange={onUserChanged}
                    shouldFilterItem={() => true}
                    itemToString={(item) => `${item?.person?.display ?? item?.display ?? ''}`}
                    onInputChange={handleSearchQueryChange}
                    placeholder="Filter..."
                    initialSelectedItem={usersResults.find((user) => user.uuid === model?.userUuid) ?? null}
                  />
                </>
              )}
            </div>
          </section>
          <section className={styles.section}>
            <div>
              <Select
                name="role"
                className="select-field"
                labelText={t('role', 'Role')}
                id="select-role"
                value={formModel.role ?? 'placeholder-item'}
                onChange={onRoleChange}
              >
                <SelectItem disabled hidden value="placeholder-item" text={t('chooseARole', 'Choose a role')} />

                {editMode ? (
                  <SelectItem key={formModel?.role} value={formModel?.role} text={formModel?.role} />
                ) : (
                  (user?.roles ?? roles)?.map((role) => {
                    return <SelectItem key={role.display} value={role.display} text={role.display} />;
                  })
                )}
              </Select>
            </div>
          </section>
          <section className={styles.section}>
            <CheckboxGroup className={styles.checkboxGrid}>
              <Checkbox
                onChange={onEnabledChanged}
                checked={formModel?.enabled}
                labelText={t('enabled', 'Enabled ?')}
                value={model?.enabled}
                id="chk-userEnabled"
              />
              <Checkbox
                onChange={onPermanentChanged}
                name="isPermanent"
                checked={formModel?.permanent}
                value={model?.permanent}
                labelText={t('permanent', 'Permanent ?')}
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
                      labelText={t('activeFrom', 'Active From')}
                      value={formatForDatePicker(formModel?.activeFrom)}
                    />
                    <DatePickerInput
                      id="date-picker-input-id-finish"
                      name="activeTo"
                      placeholder={DATE_PICKER_FORMAT}
                      labelText={t('activeTo', 'Active To')}
                      value={formatForDatePicker(formModel?.activeTo)}
                    />
                  </DatePicker>
                </>
              )}
            </CheckboxGroup>
          </section>
          <br />
          <section className={styles.section}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span className={styles.sectionTitle}> {t('stockOperation', 'Stock Operations')}</span>
              <div className={styles.hr} />
              <span className={styles.subTitle}>
                {t('roleDescription', 'The role will be applicable to only selected stock operations.')}
              </span>
            </div>
          </section>
          <section className={styles.section}>
            <CheckboxGroup className={styles.checkboxGrid}>
              {stockOperations?.length > 0 &&
                stockOperations.map((type) => {
                  return (
                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                      <Checkbox
                        value={type.uuid}
                        checked={isOperationChecked(type)}
                        className={styles.checkbox}
                        onChange={(event) => onStockOperationTypeChanged(event)}
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
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span className={styles.sectionTitle}> {t('locations', 'Locations')}</span>
              <div className={styles.hr} />
              <span className={styles.subTitle}>
                {t('toggleMessage', 'Use the toggle to apply this scope to the locations under the selected location.')}
              </span>
            </div>
          </section>
          <section className={styles.section}>
            <CheckboxGroup className={styles.checkboxGrid}>
              {stockLocations?.length > 0 &&
                stockLocations.map((type) => {
                  const checkedLocation = findCheckedLocation(type);

                  const getToggledValue = (locationUuid) => {
                    const location = checkedLocation?.locationUuid === locationUuid ? checkedLocation : null;
                    return location?.enableDescendants === true;
                  };

                  return (
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'row',
                        margin: '4px',
                        padding: '5px',
                      }}
                    >
                      <Checkbox
                        name="location"
                        key={`chk-loc-child-key-${type.id}`}
                        id={`chk-loc-child-${type.id}`}
                        value={type.id}
                        onChange={(event) => onLocationCheckBoxChanged(event)}
                        className={styles.checkbox}
                        labelText={type.name}
                        checked={checkedLocation != null}
                      />
                      {checkedLocation && (
                        <Toggle
                          value={type.id}
                          hideLabel
                          className={styles.toggle}
                          size={'sm'}
                          onToggleClick={getToggledValue(type.id)}
                          key={`tg-loc-child-key-${type.id}`}
                          id={`tg-loc-child-${type.id}`}
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
            {t('cancel', 'Cancel')}
          </Button>
          <Button type="submit" onClick={addStockUserRole}>
            {t('save', 'Save')}
          </Button>
        </ModalFooter>
      </Form>
    </div>
  );
};

export default AddStockUserRoleScope;
