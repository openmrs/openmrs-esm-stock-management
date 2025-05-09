import React, { ChangeEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  ButtonSet,
  Checkbox,
  CheckboxGroup,
  ComboBox,
  DatePicker,
  DatePickerInput,
  Form,
  FormGroup,
  InlineLoading,
  Select,
  SelectItem,
  Stack,
  Toggle,
} from '@carbon/react';
import styles from './add-stock-user-role-scope.scss';
import {
  useRoles,
  useStockOperationTypes,
  useStockTagLocations,
  useUser,
  useUsers,
} from '../../stock-lookups/stock-lookups.resource';
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
import { createOrUpdateUserRoleScope } from '../stock-user-role-scopes.resource';
import { handleMutate } from '../../utils';
import { ResourceRepresentation } from '../../core/api/api';
import { restBaseUrl, showSnackbar, useSession } from '@openmrs/esm-framework';
import { Role } from '../../core/api/types/identity/Role';
import { StockOperationType } from '../../core/api/types/stockOperation/StockOperationType';
import { User } from '../../core/api/types/identity/User';
import { UserRoleScope } from '../../core/api/types/identity/UserRoleScope';
import { UserRoleScopeLocation } from '../../core/api/types/identity/UserRoleScopeLocation';
import { UserRoleScopeOperationType } from '../../core/api/types/identity/UserRoleScopeOperationType';

const MinDate: Date = today();

interface AddStockUserRoleScopeProps {
  model?: UserRoleScope;
  editMode?: boolean;
  closeWorkspace?: () => void;
}

const AddStockUserRoleScope: React.FC<AddStockUserRoleScopeProps> = ({ model, editMode, closeWorkspace }) => {
  const { t } = useTranslation();
  const currentUser = useSession();
  const [formModel, setFormModel] = useState<UserRoleScope>({ ...model });
  const [roles, setRoles] = useState<Role[]>([]);
  const loggedInUserUuid = currentUser?.user?.uuid;
  const [selectedUserUuid, setSelectedUserUuid] = useState<string | null>(null);
  const { data: user } = useUser(selectedUserUuid);

  // operation types
  const {
    types: { results: stockOperations },
    isLoading,
  } = useStockOperationTypes();

  // get users
  const { items: users, isLoading: loadingUsers } = useUsers({
    v: ResourceRepresentation.Default,
  });

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
        closeWorkspace();
      },
      (err) => {
        showSnackbar({
          title: t('errorSavingUserRoleScope', 'Error Saving user role scope'),
          kind: 'error',
          isLowContrast: true,
          subtitle: err?.message,
        });

        closeWorkspace();
      },
    );
  };

  if (isLoading || loadingRoles || loadingUsers) {
    return (
      <InlineLoading status="active" iconDescription="Loading" description={t('loadingData', 'Loading data...')} />
    );
  }

  return (
    <Form className={styles.container}>
      <Stack className={styles.form} gap={5}>
        <div>
          {users?.results?.length > 0 && (
            <>
              <FormGroup legendText="">
                <ComboBox
                  id="userName"
                  initialSelectedItem={usersResults.find((user) => user.uuid === model?.userUuid) ?? null}
                  itemToString={(item) => item?.person?.display || item?.display || ''}
                  items={filteredItems.length ? filteredItems : usersResults}
                  onChange={onUserChanged}
                  onInputChange={handleSearchQueryChange}
                  placeholder={t('chooseAUser', 'Choose a user')}
                  titleText={t('user', 'User')}
                />
              </FormGroup>
            </>
          )}
        </div>
        <Select labelText={t('role', 'Role')} name="role" onChange={onRoleChange} value={formModel.role}>
          <SelectItem text={t('chooseARole', 'Choose a role')} value={''} />
          {editMode ? (
            <SelectItem key={formModel?.role} value={formModel?.role} text={formModel?.role} />
          ) : (
            (user?.roles ?? roles)?.map((role) => (
              <SelectItem key={role.display} value={role.display} text={role.display} />
            ))
          )}
        </Select>
        <CheckboxGroup className={styles.checkboxGrid}>
          <Checkbox
            checked={formModel?.enabled}
            id="chk-userEnabled"
            labelText={t('enabled', 'Enabled?')}
            onChange={onEnabledChanged}
            value={model?.enabled}
          />
          <Checkbox
            checked={formModel?.permanent}
            id="chk-userPermanent"
            labelText={t('permanent', 'Permanent?')}
            name="isPermanent"
            onChange={onPermanentChanged}
            value={model?.permanent}
          />
          {!formModel?.permanent && (
            <>
              <DatePicker
                dateFormat={DATE_PICKER_CONTROL_FORMAT}
                datePickerType="range"
                light
                locale="en"
                minDate={formatForDatePicker(MinDate)}
                onChange={onActiveDatesChange}
              >
                <DatePickerInput
                  name="activeFrom"
                  placeholder={DATE_PICKER_FORMAT}
                  labelText={t('activeFrom', 'Active from')}
                  value={formatForDatePicker(formModel?.activeFrom)}
                />
                <DatePickerInput
                  name="activeTo"
                  placeholder={DATE_PICKER_FORMAT}
                  labelText={t('activeTo', 'Active to')}
                  value={formatForDatePicker(formModel?.activeTo)}
                />
              </DatePicker>
            </>
          )}
        </CheckboxGroup>
        <FormGroup legendText={t('stockOperations', 'Stock operations')}>
          <span className={styles.subTitle}>
            {t('roleDescription', 'The role will be applicable to only selected stock operations.')}
          </span>
        </FormGroup>
        <CheckboxGroup className={styles.checkboxGrid}>
          {stockOperations?.length > 0 &&
            stockOperations.map((type) => (
              <Checkbox
                checked={isOperationChecked(type)}
                className={styles.checkbox}
                id={type.uuid}
                labelText={type.name}
                onChange={(event) => onStockOperationTypeChanged(event)}
                value={type.uuid}
              />
            ))}
        </CheckboxGroup>
        <FormGroup legendText={t('locations', 'Locations')}>
          <span className={styles.subTitle}>
            {t('toggleMessage', 'Use the toggle to apply this scope to the locations under the selected location.')}
          </span>
        </FormGroup>
        <CheckboxGroup className={styles.checkboxGrid}>
          {stockLocations?.length > 0 &&
            stockLocations.map((type) => {
              const checkedLocation = findCheckedLocation(type);

              const getToggledValue = (locationUuid) => {
                const location = checkedLocation?.locationUuid === locationUuid ? checkedLocation : null;
                return location?.enableDescendants === true;
              };

              return (
                <div className={styles.flexRow}>
                  <Checkbox
                    checked={checkedLocation != null}
                    className={styles.checkbox}
                    id={`chk-loc-child-${type.id}`}
                    key={`chk-loc-child-key-${type.id}`}
                    labelText={type.name}
                    name="location"
                    onChange={(event) => onLocationCheckBoxChanged(event)}
                    value={type.id}
                  />
                  {checkedLocation && (
                    <Toggle
                      className={styles.toggle}
                      hideLabel
                      id={`tg-loc-child-${type.id}`}
                      key={`tg-loc-child-key-${type.id}`}
                      onToggleClick={getToggledValue(type.id)}
                      size={'sm'}
                      value={type.id}
                    />
                  )}
                </div>
              );
            })}
        </CheckboxGroup>
      </Stack>
      <ButtonSet>
        <Button className={styles.button} kind="secondary" onClick={closeWorkspace}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button className={styles.button} type="submit" onClick={addStockUserRole}>
          {t('save', 'Save')}
        </Button>
      </ButtonSet>
    </Form>
  );
};

export default AddStockUserRoleScope;
