import { Checkbox, CheckboxSkeleton, ComboBox, DatePicker, DatePickerInput, Form, Select, SelectItem, SelectSkeleton, ToggleSmall } from 'carbon-components-react';
import { Formik, FormikProps, FormikValues } from 'formik';
import { cloneDeep, debounce } from 'lodash-es';
import React, { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useAppSelector } from '../app/hooks';
import { ResourceRepresentation } from '../core/api/api';
import { UserFilterCriteria, useGetLocationsQuery, useGetStockOperationTypesQuery, useLazyGetUserQuery, useLazyGetUsersQuery } from '../core/api/lookups';
import { OpenMRSLocation } from '../core/api/types/Location';
import { Role } from '../core/api/types/identity/Role';
import { User } from '../core/api/types/identity/User';
import { UserRoleScope } from '../core/api/types/identity/UserRoleScope';
import { UserRoleScopeLocation } from '../core/api/types/identity/UserRoleScopeLocation';
import { UserRoleScopeOperationType } from '../core/api/types/identity/UserRoleScopeOperationType';
import { StockOperationType } from '../core/api/types/stockOperation/StockOperationType';
import { INVENTORY_ROLE_NAME } from '../core/consts';
import { DATE_PICKER_CONTROL_FORMAT, DATE_PICKER_FORMAT, formatForDatePicker, today } from '../core/utils/datetimeUtils';
import { toErrorMessage } from '../core/utils/stringUtils';
import useTranslation from '../core/utils/translation';
import { selectUserId } from '../stock-auth/authSlice';
import { createValidationSchema, editValidationSchema } from './validationSchema';

export interface EditUserScopeProps {
    model: UserRoleScope
    isNew: boolean,
    validateForm: boolean,
    onValidationComplete: (isSuccess: boolean, model: UserRoleScope) => void;
    onFormLoading?: (isLoading: boolean) => void;
}

const MinDate: Date = today();

export const EditUserScope: React.FC<EditUserScopeProps> = ({
    model,
    isNew,
    validateForm,
    onValidationComplete,
    onFormLoading
}) => {
    const { t } = useTranslation();
    const t2 = (token: any) => {
        if (token) return t(token!);
        return "";
    }
    const currentUserId = useAppSelector(selectUserId);
    const [getUsers, { data: users, error: loadUsersError, isLoading: isLoadingUsers }] = useLazyGetUsersQuery();
    const [getUser, { data: user, error: loadUserError, isFetching: isFetchingUser, isSuccess: loadedUser }] = useLazyGetUserQuery();
    const [roles, setRoles] = useState<Role[]>([]);
    const { data: locations, error: loadLocationsError, isLoading: isLoadingLocations, isFetching: isFetchingLocations, isSuccess: loadedLocations } = useGetLocationsQuery({ v: ResourceRepresentation.Default });
    const { data: stockOperationTypes, error: loadStockOperationTypesError, isFetching: isFetchingStockOperationTypes, isSuccess: loadedStockOperationTypes } = useGetStockOperationTypesQuery();
    const [formModel, setFormModel] = useState<UserRoleScope>({ ...model })
    const formikRef = useRef<FormikProps<FormikValues>>(null);
    const [formikErrors, setFormikErrors] = useState<any>(null);

    const handleUsersSearch = useMemo(() => debounce((searchTerm) => {
        getUsers({ v: ResourceRepresentation.Default, q: searchTerm } as any as UserFilterCriteria);
    }, 300), [getUsers]);

    useEffect(() => {
        onFormLoading?.(isFetchingUser || isLoadingUsers || isFetchingStockOperationTypes || isLoadingLocations);
    }, [isFetchingUser, isLoadingUsers, isFetchingStockOperationTypes, isLoadingLocations, onFormLoading])

    useEffect(() => {
        if (isNew) {
            getUsers({ v: ResourceRepresentation.Default } as any as UserFilterCriteria);
        } else {
            getUser(model?.userUuid!);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onFormSubmit = async (e: React.FormEvent<HTMLFormElement>, hasValidated?: boolean) => {
        e?.preventDefault();
        if (formikErrors) {
            setFormikErrors(null);
        }
        let success = true;
        try {
            // do validation            
            if (!!!hasValidated) {
                if (formikRef.current) {
                    await formikRef.current.validateForm().then((e) => {
                        if (!!!formikRef.current?.isValid) {
                            success = false;
                            setFormikErrors(e);
                        }
                    }, (f) => {
                        success = false;
                    });
                }
            }
        } finally {
            onValidationComplete?.(success, formModel);
        }
    }

    useEffect(() => {
        if (validateForm) {
            onFormSubmit(null!, false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [validateForm, onValidationComplete, formModel])

    const onRoleChange = (e: ChangeEvent<HTMLSelectElement>) => {
        let rootLocations = locations?.results?.filter(x => !x.parentLocation)?.map(x => x.uuid);
        let newLocations = [...(formModel.locations?.filter(x => !rootLocations || rootLocations.length === 0 || !rootLocations.some(p => p === x.locationUuid)) ?? [])];
        setFormModel({ ...formModel, role: e.target.value, locations: newLocations });
        formikRef?.current?.setFieldValue("location", newLocations.map(x => x.uuid));
        formikRef?.current?.setFieldValue("role", e.target.value);
        if (formikErrors?.role) {
            setFormikErrors({ ...formikErrors, role: null });
        }
    }
    const onActiveDatesChange = (dates: Date[]): void => {
        setFormModel({ ...formModel, activeFrom: dates[0], activeTo: dates[1] });
        formikRef?.current?.setFieldValue("activeFrom", dates[0]);
        formikRef?.current?.setFieldValue("activeTo", dates[1]);
        if (formikErrors?.activeFrom || formikErrors?.activeTo) {
            setFormikErrors({ ...formikErrors, activeFrom: null, activeTo: null });
        }
    }
    const onStockOperationTypeChanged = (chkboxChecked: boolean, id: string, cvt: React.ChangeEvent<HTMLInputElement>): void => {
        let operationType = formModel.operationTypes.find(x => x.operationTypeUuid === cvt.target.value);
        if (operationType) {
            let newOperationTypes = [...(formModel.operationTypes.filter(x => x.operationTypeUuid !== operationType?.operationTypeUuid))];
            setFormModel({ ...formModel, operationTypes: newOperationTypes })
            formikRef?.current?.setFieldValue("operationType", newOperationTypes.map(x => x.operationTypeUuid));
        }
        else {
            let stockOperationType = stockOperationTypes?.results?.find(x => x.uuid === cvt.target.value);
            let operationType: UserRoleScopeOperationType = {
                operationTypeName: stockOperationType?.name,
                operationTypeUuid: stockOperationType?.uuid
            } as unknown as UserRoleScopeOperationType;
            setFormModel({ ...formModel, operationTypes: [...(formModel.operationTypes ?? []), operationType] });
            formikRef?.current?.setFieldValue("operationType", [stockOperationType?.uuid]);
        }
        if (formikErrors?.operationType) {
            setFormikErrors({ ...formikErrors, operationType: null });
        }
    }
    const onPermanentChanged = (cvt: React.ChangeEvent<HTMLInputElement>, data: { checked: boolean; id: string; }): void => {
        let isPermanent = !formModel.permanent;
        setFormModel({ ...formModel, permanent: isPermanent, activeFrom: undefined, activeTo: undefined });

        formikRef?.current?.setFieldValue("isPermanent", isPermanent);
        formikRef?.current?.setFieldValue("activeFrom", model.activeFrom);
        formikRef?.current?.setFieldValue("activeTo", model.activeTo);
        if (formikErrors?.activeFrom || formikErrors?.activeTo) {
            setFormikErrors({ ...formikErrors, activeFrom: null, activeTo: null });
        }
    }

    const onEnabledChanged = (cvt: React.ChangeEvent<HTMLInputElement>, data: { checked: boolean; id: string; }): void => {
        let isEnabled = !formModel.enabled;
        setFormModel({ ...formModel, enabled: isEnabled });
    }

    const onLocationCheckBoxChanged = (chkboxChecked: boolean, id: string, cvt: React.ChangeEvent<HTMLInputElement>): void => {
        let selectedLocation = formModel.locations?.find(x => x.locationUuid === cvt.target.value);
        if (selectedLocation) {
            let newLocations = [...(formModel.locations?.filter(x => x.locationUuid !== selectedLocation?.locationUuid) ?? [])];
            setFormModel({ ...formModel, locations: newLocations });
            formikRef?.current?.setFieldValue("location", newLocations.map(x => x.locationUuid));
        }
        else {
            let loc = locations?.results?.find(x => x.uuid === cvt.target.value);
            let newLocation: UserRoleScopeLocation = {
                locationName: loc?.display,
                locationUuid: loc?.uuid,
                enableDescendants: false
            } as unknown as UserRoleScopeLocation;
            let newLocations = [...(formModel.locations ?? []), newLocation];
            setFormModel({ ...formModel, locations: newLocations })
            formikRef?.current?.setFieldValue("location", newLocations.map(x => x.locationUuid));
        }
        if (formikErrors?.location) {
            setFormikErrors({ ...formikErrors, location: null });
        }
    }
    const onEnableDescendantsChanged = (cvt: React.ChangeEvent<HTMLInputElement>) => {
        let selectedLocation = formModel.locations?.find(x => x.locationUuid === cvt.target.value);
        if (selectedLocation) {
            var enableDescendants = !(selectedLocation.enableDescendants === true);
            var newModifiedLocation = { ...selectedLocation, enableDescendants: enableDescendants };
            setFormModel({ ...formModel, locations: [...(formModel.locations?.filter(x => x.locationUuid !== selectedLocation?.locationUuid) ?? []), newModifiedLocation] })
        }
    }
    const isOperationChecked = (operationType: StockOperationType) => {
        return formModel.operationTypes?.filter(x => x.operationTypeUuid === operationType.uuid)?.length > 0;
    }
    const findCheckedLocation = (location: OpenMRSLocation): UserRoleScopeLocation | null => {
        let result = formModel.locations?.filter(x => x.locationUuid === location.uuid);
        return result && result.length > 0 ? result[0] : null;
    }
    const onUserChanged = (data: { selectedItem: User }) => {
        setFormModel({ ...formModel, userUuid: data.selectedItem?.uuid });
        formikRef?.current?.setFieldValue("user", data.selectedItem?.uuid)
        setRoles(data.selectedItem?.roles ?? []);
        getUser(data.selectedItem?.uuid);
        if (formikErrors?.user) {
            setFormikErrors({ ...formikErrors, user: null });
        }
    }

    const sortedOperationTypes = useMemo(() => {
        if (stockOperationTypes?.results) {
            let copyOfTypes = cloneDeep(stockOperationTypes?.results);
            copyOfTypes.sort((a, b) => a.name.localeCompare(b.name) ?? 0)
            return copyOfTypes;
        }
        return [];
    }, [stockOperationTypes])

    const sortedLocations = useMemo(() => {
        if (locations?.results) {
            let copyOfTypes = cloneDeep(locations?.results);
            copyOfTypes.sort((a, b) => a.display.localeCompare(b.display) ?? 0)
            return copyOfTypes;
        }
        return [];
    }, [locations])

    return <Formik innerRef={formikRef} validationSchema={isNew ? createValidationSchema : editValidationSchema} initialValues={{
        user: formModel?.userUuid,
        role: formModel?.role,
        isPermanent: formModel?.permanent,
        activeFrom: formModel?.activeFrom,
        activeTo: formModel?.activeTo,
        operationType: formModel?.operationTypes?.map(p => p.operationTypeUuid),
        location: formModel?.locations?.map(p => p.locationUuid)
    }} onSubmit={values => {
        onFormSubmit(null!, true);
    }}>
        {({ errors, touched, validateField, validateForm }) => (
            <Form className='user-role-scope-edit smt-form' onSubmit={onFormSubmit}>
                {
                    isNew && isLoadingUsers && <SelectSkeleton hideLabel />
                }
                {
                    isNew && !isLoadingUsers && loadUsersError &&
                    <span className="error-text">{t('stockmanagement.useruserscope.loaduserserror')} {toErrorMessage(loadUsersError)}</span>
                }
                {
                    isNew && !isLoadingUsers && <>
                        <ComboBox titleText={t('stockmanagement.userrolescope.edit.user')}
                            invalid={!!(formikErrors?.user)} invalidText={t(formikErrors?.user)}
                            name="user" id="select-user" light
                            items={(users?.results ?? []).filter(x => x.uuid !== currentUserId)}
                            onChange={onUserChanged}
                            shouldFilterItem={(data) => true}
                            onFocus={() => users?.results || handleUsersSearch("")}
                            onToggleClick={() => users?.results || handleUsersSearch("")}
                            onInputChange={(e) => handleUsersSearch(e)}
                            itemToString={item => (`${item?.person?.display ?? item?.display ?? ''}`)}
                            placeholder={'Filter...'} />
                    </>
                }
                {
                    !isNew && isFetchingUser && <SelectSkeleton hideLabel />
                }
                {
                    !isNew && !isFetchingUser && !loadedUser &&
                    <span className="error-text">{t('stockmanagement.userrolescope.loadroleserror')} {toErrorMessage(loadUserError)}</span>
                }

                <Select invalid={!!(formikErrors?.role)} invalidText={t2(formikErrors?.role)} name='role' className='select-field' labelText={t('stockmanagement.userrolescope.edit.role')} id="select-role" value={formModel.role ?? "placeholder-item"} onChange={onRoleChange}>
                    <SelectItem disabled hidden value="placeholder-item" text="Choose a role" />
                    {(user?.roles ?? roles)?.map(role => {
                        return <SelectItem key={role.display} value={role.display} text={role.display} />
                    })}
                </Select>

                <div className="user-role-scope-permanent">
                    <Checkbox id="chk-enable" checked={formModel.enabled} onChange={onEnabledChanged} labelText={t("stockmanagement.userrolescope.list.header.enabled")} />
                    <Checkbox id="chk-permanent" name="isPermanent" checked={formModel.permanent} onChange={onPermanentChanged} labelText={t("stockmanagement.userrolescope.list.header.permanent")} />
                    {!formModel.permanent && <>
                        <DatePicker datePickerType="range" light minDate={formatForDatePicker(MinDate)} locale="en" dateFormat={DATE_PICKER_CONTROL_FORMAT} onChange={onActiveDatesChange}>
                            <DatePickerInput invalid={!!(formikErrors?.activeFrom)} invalidText={t2(formikErrors?.activeFrom)}
                                id="date-picker-input-id-start"
                                name="activeFrom"
                                placeholder={DATE_PICKER_FORMAT}
                                labelText={t('stockmanagement.userrolescope.list.header.activeFrom')}
                                value={formatForDatePicker(formModel.activeFrom)}
                            />
                            <DatePickerInput invalid={!!(formikErrors?.activeTo)} invalidText={t2(formikErrors?.activeTo)}
                                id="date-picker-input-id-finish"
                                name="activeTo"
                                placeholder={DATE_PICKER_FORMAT}
                                labelText={t('stockmanagement.userrolescope.list.header.activeTo')}
                                value={formatForDatePicker(formModel.activeTo)}
                            />
                        </DatePicker>
                    </>
                    }
                </div>
                {
                    isFetchingStockOperationTypes && <CheckboxSkeleton />
                }
                {
                    !isFetchingStockOperationTypes && !loadedStockOperationTypes &&
                    <span className="error-text">{t('stockmanagement.loadstockoperationtypeserror')} {toErrorMessage(loadStockOperationTypesError)}</span>
                }
                {
                    !isFetchingStockOperationTypes && loadedStockOperationTypes && <>
                        <div className='field-label'>
                            <span className='field-title underline'>{t('stockmanagement.userrolescope.edit.stockoperations')}</span>
                            <span className='field-desc'>{t('stockmanagement.userrolescope.edit.stockoperationsdescription')}</span>
                            {formikErrors?.operationType && <div className="error-msg">{t2(formikErrors?.operationType)}</div>}
                        </div>
                        <div className='operation-types'>
                            {sortedOperationTypes.map(stockOperationType => {
                                return <div key={`chk-sopt-child-key-${stockOperationType.uuid}`} className='operation-type'><Checkbox name="operationType" id={`chk-sopt-child-${stockOperationType.uuid}`} value={stockOperationType.uuid} onChange={onStockOperationTypeChanged} checked={isOperationChecked(stockOperationType)} labelText={stockOperationType.name} /></div>
                            })}
                        </div>
                    </>
                }

                {
                    isLoadingLocations && <SelectSkeleton hideLabel />
                }
                {
                    !isFetchingLocations && !loadedLocations &&
                    <span className="error-text">{t('stockmanagement.userrolescope.loadlocationserror')} {toErrorMessage(loadLocationsError)}</span>
                }
                {
                    !isLoadingLocations && loadedLocations &&
                    <>
                        <div className='field-label'>
                            <span className='field-title underline'>{t('stockmanagement.userrolescope.edit.locations')}</span>
                            <span className='field-desc'>{t('stockmanagement.userrolescope.edit.locationsdescendantsdescription')}</span>
                            {formikErrors?.location && <div className="error-msg">{t2(errors?.location)}</div>}
                        </div>
                        <div className='locations'>
                            {sortedLocations.filter(x => formModel.role === INVENTORY_ROLE_NAME || !!x.parentLocation).map(location => {
                                var checkedLocation = findCheckedLocation(location);
                                return <div key={`div-loc-child-key-${location.uuid}`} className="location">
                                    <Checkbox name="location" key={`chk-loc-child-key-${location.uuid}`} id={`chk-loc-child-${location.uuid}`} onChange={onLocationCheckBoxChanged} value={location.uuid} checked={checkedLocation != null} labelText={location.display} />
                                    {checkedLocation && <ToggleSmall aria-label={t("stockmanagement.userrolescope.locationsbelow")} toggled={checkedLocation?.enableDescendants === true} onChange={onEnableDescendantsChanged} value={location.uuid} key={`tg-loc-child-key-${location.uuid}`} id={`tg-loc-child-${location.uuid}`} />}
                                </div>
                            })}
                        </div>
                    </>
                }

            </Form>
        )}
    </Formik>
};