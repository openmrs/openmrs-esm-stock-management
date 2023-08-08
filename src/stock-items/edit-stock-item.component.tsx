import { Save24, Undo24 } from '@carbon/icons-react';
import { Button, ComboBox, Form, FormGroup, NumberInput, RadioButton, RadioButtonGroup, RadioButtonValue, Select, SelectItem, SelectSkeleton, TextInput, ToastNotification } from 'carbon-components-react';
import { Formik, FormikProps, FormikValues } from 'formik';
import { produce } from "immer";
import { debounce } from 'lodash-es';
import React, { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import { DISPENSING_UNITS_CONCEPT_ID, STOCK_ITEM_CATEGORY_CONCEPT_ID } from '../constants';
import { ResourceRepresentation } from '../core/api/api';
import { ConceptFilterCriteria, DrugFilterCriteria, useLazyGetConceptByIdQuery, useLazyGetConceptsQuery, useLazyGetDrugsQuery } from '../core/api/lookups';
import { useLazyGetStockItemsQuery } from '../core/api/stockItem';
import { useLazyGetStockSourcesQuery } from '../core/api/stockSource';
import { PageableResult } from '../core/api/types/PageableResult';
import { Concept } from '../core/api/types/concept/Concept';
import { StockItemDTO } from '../core/api/types/stockItem/StockItem';
import { StockItemPackagingUOMDTO } from '../core/api/types/stockItem/StockItemPackagingUOM';
import { StockSource } from '../core/api/types/stockOperation/StockSource';
import useTranslation from '../core/utils/translation';
import { createValidationSchema, editValidationSchema } from './validationSchema';

export interface EditStockItemProps {
    model: StockItemDTO;
    setModel: React.Dispatch<React.SetStateAction<StockItemDTO>>;
    isNew: boolean;
    setShowSplash: React.Dispatch<React.SetStateAction<boolean>>;
    setSelectedTab: React.Dispatch<React.SetStateAction<number>>;
    canEdit: boolean;
    packagingUnits: StockItemPackagingUOMDTO[];
    actions: {
        onGoBack: () => void;
        onSave: () => void;
    };
}

export const EditStockItem: React.FC<EditStockItemProps> = ({
    model,
    setModel,
    isNew,
    canEdit,
    setShowSplash,
    setSelectedTab,
    actions,
    packagingUnits
}) => {
    const { t } = useTranslation();
    const t2 = (token: any) => {
        if (token) return t(token!);
        return "";
    }
    const [getDrugs, { data: drugList }] = useLazyGetDrugsQuery();
    const [getConcepts, { data: conceptsList }] = useLazyGetConceptsQuery();
    const [getStockSources, { data: stockSourceList, isFetching: isFetchingStockSourceList }] = useLazyGetStockSourcesQuery();
    const formikRef = useRef<FormikProps<FormikValues>>(null);
    const [getDispensingUnits, { data: dispensingUnits, isFetching: isFetchingDispensingUnits }] = useLazyGetConceptByIdQuery();
    const [getCategories, { data: categories, isFetching: isFetchingCategories }] = useLazyGetConceptByIdQuery();
    const [disableSaveButton, setDisableSaveButton] = useState(isNew);
    const [showItemExists, setShowItemExists] = useState(false);
    const [getStockItems] = useLazyGetStockItemsQuery();

    useEffect(() => {
        formikRef?.current?.setFieldValue("hasPackagingUnits", packagingUnits != null && packagingUnits.length > 0);
    }, [packagingUnits])

    useEffect(() => {
        async function loadLookups() {
            if (canEdit) {
                if (!stockSourceList) {
                    await getStockSources(null);
                }
                if (!dispensingUnits) {
                    await getDispensingUnits(DISPENSING_UNITS_CONCEPT_ID);
                }
                if (!categories) {
                    await getCategories(STOCK_ITEM_CATEGORY_CONCEPT_ID);
                }
            }
        }
        loadLookups();

    }, [canEdit, categories, dispensingUnits, getCategories, getDispensingUnits, getStockSources, stockSourceList]);

    const checkItemExistence = (drugId?: string | null, conceptId?: string | null) => {
        if (!drugId && !conceptId) {
            setDisableSaveButton(true);
            return;
        }

        getStockItems({ drugUuid: drugId, conceptUuid: conceptId, startIndex: 0, limit: 1 }).unwrap().then((payload: any) => {
            if ((payload as any).error) {
                setDisableSaveButton(false);
                return;
            }
            let result = payload as PageableResult<StockItemDTO>;
            let itemExists = (result?.results?.length ?? 0) !== 0;
            setDisableSaveButton(itemExists);
            setShowItemExists(itemExists);
        }).catch(e => {
            setDisableSaveButton(false);
        });
    };

    const handleDrugSearch = useMemo(() => debounce((searchTerm) => {
        getDrugs({ v: ResourceRepresentation.Default, q: searchTerm, startIndex: 0, limit: 10 } as any as DrugFilterCriteria);
    }, 300), [getDrugs]);

    const onDrugChanged = (data: { selectedItem: any }) => {
        setShowItemExists(false);
        setModel(
            produce((draft) => {
                if (data?.selectedItem) {
                    draft.drugUuid = data.selectedItem.uuid;
                    draft.drugName = `${data?.selectedItem?.name}${data?.selectedItem?.concept ? (` (${data?.selectedItem?.concept.display})`) : ""}`;
                }
                else {
                    draft.drugUuid = null;
                    draft.drugName = null;
                    setDisableSaveButton(true);
                }
                draft.conceptUuid = null;
                draft.conceptName = null;
            })
        );
        formikRef?.current?.setFieldValue("drugUuid", data?.selectedItem?.uuid);
        formikRef?.current?.setFieldValue("conceptUuid", null);
        if (data?.selectedItem?.uuid) {
            checkItemExistence(data?.selectedItem.uuid, null);
        }
    }

    const handleConceptSearch = useMemo(() => debounce((searchTerm) => {
        getConcepts({ v: ResourceRepresentation.Default, q: searchTerm, startIndex: 0, limit: 10 } as any as ConceptFilterCriteria);
    }, 300), [getConcepts]);

    const onConceptChanged = (data: { selectedItem: any }) => {
        setShowItemExists(false);
        setModel(
            produce((draft) => {
                if (data?.selectedItem) {
                    draft.conceptUuid = data.selectedItem.uuid;
                    draft.conceptName = data?.selectedItem?.display;
                }
                else {
                    draft.conceptUuid = null;
                    draft.conceptName = null;
                }
                draft.drugUuid = null;
                draft.drugName = null;
            })
        );
        formikRef?.current?.setFieldValue("conceptUuid", data?.selectedItem?.uuid);
        formikRef?.current?.setFieldValue("drugUuid", null);
        if (data?.selectedItem?.uuid) {
            checkItemExistence(null, data?.selectedItem.uuid);
        }
    }

    const onIsDrugChange = (selection: RadioButtonValue, name: string, evt: ChangeEvent<HTMLInputElement>) => {
        setShowItemExists(false);
        var isDrug = selection === "true";
        setModel(
            produce((draft) => {
                draft.isDrug = isDrug;
                if (isDrug) {
                    draft.conceptUuid = null;
                    draft.conceptName = null;
                } else {
                    draft.drugUuid = null;
                    draft.drugName = null;
                    draft.dispensingUnitUuid = null;
                }
            })
        );
        formikRef?.current?.setFieldValue("isDrug", isDrug);
        if (isDrug) {
            formikRef?.current?.setFieldValue("conceptUuid", null);
        } else {
            formikRef?.current?.setFieldValue("drugUuid", null);
            formikRef?.current?.setFieldValue("dispensingUnitUuid", null);
        }
    }

    const onHasExpirationChanged = (selection: RadioButtonValue, name: string, evt: ChangeEvent<HTMLInputElement>) => {
        setModel(
            produce((draft) => {
                draft.hasExpiration = selection === "true";
            })
        );
        formikRef?.current?.setFieldValue("hasExpiration", selection === "true");
    }

    const onCommonNameChanged = (evt: React.ChangeEvent<HTMLInputElement>) => {
        let newValue = evt.target.value;
        setModel(produce((draft) => {
            draft.commonName = newValue;
        })
        );
        formikRef?.current?.setFieldValue("commonName", newValue);
    }

    const onAcronymChanged = (evt: React.ChangeEvent<HTMLInputElement>) => {
        let newValue = evt.target.value;
        setModel(produce((draft) => {
            draft.acronym = newValue;
        })
        );
        formikRef?.current?.setFieldValue("acronym", newValue);
    }

    const onPreferredVendorChange = (data: { selectedItem: StockSource }) => {
        let party = data.selectedItem;
        setModel(produce((draft) => {
            draft.preferredVendorUuid = party?.uuid ?? null;
            draft.preferredVendorName = party?.name ?? null;
        })
        );
        formikRef?.current?.setFieldValue("preferredVendorUuid", party?.uuid);
    }

    const onDispensingUnitChange = (data: { selectedItem: Concept }) => {
        let concept = data.selectedItem;
        setModel(produce((draft) => {
            draft.dispensingUnitUuid = concept?.uuid ?? null;
            draft.dispensingUnitName = concept?.display ?? null;
        })
        );
        formikRef?.current?.setFieldValue("dispensingUnitUuid", concept?.uuid);
    }

    const onCategoryChange = (data: { selectedItem: Concept }) => {
        let concept = data.selectedItem;
        setModel(produce((draft) => {
            draft.categoryUuid = concept?.uuid ?? null;
            draft.categoryName = concept?.display ?? null;
        })
        );
        formikRef?.current?.setFieldValue("categoryUuid", concept?.uuid);
    }

    const onDispensingUnitPackagingUoMChange = (evt: ChangeEvent<HTMLSelectElement>) => {
        let selected = packagingUnits.find(x => x.uuid === evt.target.value);
        setModel(produce((draft) => {
            draft.dispensingUnitPackagingUoMUuid = selected?.uuid ?? null;
            draft.dispensingUnitPackagingUoMName = selected?.packagingUomName ?? null;
        })
        );
        formikRef?.current?.setFieldValue("dispensingUnitPackagingUoMUuid", selected?.uuid);
    }

    const onDefaultStockOperationsUoMChange = (evt: ChangeEvent<HTMLSelectElement>) => {
        let selected = packagingUnits.find(x => x.uuid === evt.target.value);
        setModel(produce((draft) => {
            draft.defaultStockOperationsUoMUuid = selected?.uuid ?? null;
            draft.defaultStockOperationsUoMName = selected?.packagingUomName ?? null;
        })
        );
        formikRef?.current?.setFieldValue("defaultStockOperationsUoMUuid", selected?.uuid);
    }

    const onReorderLevelChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
        try {
            let value = evt?.target?.value;
            let qtyValue: number | null = null;
            if (typeof value === 'number') {
                qtyValue = value;
            } else {
                qtyValue = value && value.length > 0 ? parseFloat(value) : null;
            }
            setModel(
                produce((draft) => {
                    draft.reorderLevel = qtyValue;
                })
            );
            formikRef?.current?.setFieldValue("reorderLevel", qtyValue);
            formikRef?.current?.setFieldValue("hasReorderLevel", qtyValue != null || model.reorderLevelUoMUuid != null);
        } catch (e) {
            console.log(e);
        }
    }

    const onReorderLevelUoMChange = (evt: ChangeEvent<HTMLSelectElement>) => {
        let selected = packagingUnits.find(x => x.uuid === evt.target.value);
        setModel(produce((draft) => {
            draft.reorderLevelUoMUuid = selected?.uuid ?? null;
            draft.reorderLevelUoMName = selected?.packagingUomName ?? null;
        })
        );
        formikRef?.current?.setFieldValue("reorderLevelUoMUuid", selected?.uuid);
        formikRef?.current?.setFieldValue("hasReorderLevel", !!selected?.uuid || model.reorderLevel != null);
    }

    const onPurchasePriceChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
        try {
            let value = evt?.target?.value;
            let qtyValue: number | null = null;
            if (typeof value === 'number') {
                qtyValue = value;
            } else {
                qtyValue = value && value.length > 0 ? parseFloat(value) : null;
            }
            setModel(
                produce((draft) => {
                    draft.purchasePrice = qtyValue;
                })
            );
            formikRef?.current?.setFieldValue("purchasePrice", qtyValue);
            formikRef?.current?.setFieldValue("hasPurchasePrice", qtyValue != null || !!model.purchasePriceUoMUuid);
        } catch (e) {
            console.log(e);
        }
    }

    const onExpiryNoticeChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
        try {
            let value = evt?.target?.value;
            let qtyValue: number | null = null;
            if (typeof value === 'number') {
                qtyValue = value;
            } else {
                qtyValue = value && value.length > 0 ? parseInt(value) : null;
            }
            setModel(
                produce((draft) => {
                    draft.expiryNotice = qtyValue;
                })
            );
            formikRef?.current?.setFieldValue("expiryNotice", qtyValue);
        } catch (e) {
            console.log(e);
        }
    }

    const onPurchasePriceUoMChange = (evt: ChangeEvent<HTMLSelectElement>) => {
        let selected = packagingUnits.find(x => x.uuid === evt.target.value);
        setModel(produce((draft) => {
            draft.purchasePriceUoMUuid = selected?.uuid ?? null;
            draft.purchasePriceUoMName = selected?.packagingUomName ?? null;
        })
        );
        formikRef?.current?.setFieldValue("purchasePriceUoMUuid", selected?.uuid);
        formikRef?.current?.setFieldValue("hasPurchasePrice", !!selected?.uuid || model.purchasePrice != null);
    }

    const handleSave = async () => {
        try {
            if (formikRef.current) {
                let success: boolean = true;
                await formikRef.current.validateForm().then((e) => {
                    if (!!!formikRef.current?.isValid) {
                        success = false;
                        setTimeout(() => {
                            Object.keys(e).forEach(p => {
                                formikRef.current?.setFieldTouched(p, true, true);
                            });
                        });
                    }
                }, (f) => {
                    success = false;
                });
                if (success) {
                    actions.onSave();
                }
            }
        } finally {
        }
    }

    return <Formik innerRef={formikRef} validationSchema={isNew ? createValidationSchema : editValidationSchema} initialValues={{
        isDrug: isNew ? (model.drugUuid || model.conceptUuid ? (model.drugUuid && model.drugUuid.length > 0) : null) : model.drugUuid != null,
        drugUuid: model.drugUuid,
        conceptUuid: model.conceptUuid,
        commonName: model.commonName,
        acronym: model.acronym,
        hasExpiration: model.hasExpiration,
        preferredVendorUuid: model.preferredVendorUuid,
        categoryUuid: model.categoryUuid,
        dispensingUnitUuid: model.dispensingUnitUuid,
        dispensingUnitPackagingUoMUuid: model?.dispensingUnitPackagingUoMUuid,
        hasPurchasePrice: (!!model.purchasePrice || !!model.purchasePriceUoMUuid) ?? false,
        hasReorderLevel: (!!model.reorderLevel || !!model.reorderLevelUoMUuid) ?? false,
        purchasePrice: model?.purchasePrice,
        purchasePriceUoMUuid: model?.purchasePriceUoMUuid,
        reorderLevel: model?.reorderLevel,
        reorderLevelUoMUuid: model?.reorderLevelUoMUuid,
        hasPackagingUnits: packagingUnits != null && packagingUnits.length > 0,
        expiryNotice: model.expiryNotice
    }} onSubmit={values => {
        formikRef?.current?.setSubmitting(false);
    }}>
        {({ errors, touched, validateField, validateForm, handleSubmit, isSubmitting }) => (
            <Form className='smt-form' onSubmit={handleSubmit} >
                <div className='smt-form-columns smt-items-left'>
                    <div>
                        {
                            canEdit && isNew &&
                            <FormGroup className='clear-margin-bottom'
                                invalid={touched.isDrug && !!errors.isDrug}
                                legendText={t("stockmanagement.stockitem.edit.itemtype")} title={t("stockmanagement.stockitem.edit.itemtype")}>
                                <RadioButtonGroup name="isDrug" legendText="" onChange={onIsDrugChange}>
                                    <RadioButton value="true" id="isDrug-true" labelText={t("stockmanagement.drug")} />
                                    <RadioButton value="false" id="isDrug-false" labelText={t("stockmanagement.other")} />
                                </RadioButtonGroup>
                            </FormGroup>
                        }

                        {
                            canEdit && isNew && model.isDrug && <>
                                <ComboBox titleText={t('stockmanagement.pleasespecify')}
                                    invalid={touched.drugUuid && !!errors.drugUuid} invalidText={t2(errors.drugUuid)}
                                    name='drugUuid' className='select-field' id="drugUuid"
                                    items={drugList?.results ? drugList?.results : []}
                                    onChange={onDrugChanged}
                                    onInputChange={handleDrugSearch}
                                    initialSelectedItem={drugList?.results?.find(p => p.uuid === model.drugUuid) ?? ""}
                                    itemToString={item => item ? `${item.name}${item.concept ? (` (${item.concept.display})`) : ""}` : ""}
                                    placeholder={t("stockmanagement.stockitem.edit.drugholder")} />
                            </>
                        }
                        {
                            canEdit && isNew && model.isDrug != null && !model.isDrug && <>
                                <ComboBox titleText={t('stockmanagement.pleasespecify')}
                                    invalid={touched.conceptUuid && !!errors.conceptUuid} invalidText={t2(errors.conceptUuid)}
                                    name='conceptUuid' className='select-field' id="conceptUuid"
                                    items={(conceptsList?.results ?? []) as any}
                                    onChange={onConceptChanged}
                                    onInputChange={handleConceptSearch}
                                    initialSelectedItem={conceptsList?.results?.find(p => p.uuid === model.conceptUuid) ?? ""}
                                    itemToString={item => item ? `${item.display}` : ""}
                                    placeholder={t("stockmanagement.stockitem.edit.conceptholder")} />
                            </>
                        }
                        {
                            isNew && canEdit && showItemExists &&
                            <div className="error-msg bold">{t("stockmanagement.stockitem.itemexists")}</div>
                        }


                        {
                            <TextInput id="commonName" maxLength={255} name="commonName" value={`${model?.commonName ?? ""}`}
                                readOnly={!canEdit} onChange={onCommonNameChanged}
                                invalid={touched.commonName && !!errors.commonName} invalidText={t2(errors.commonName)}
                                labelText={t('stockmanagement.stockitem.edit.commonname')} />
                        }

                        {
                            <TextInput id="acronym" maxLength={255} name="acronym" value={`${model?.acronym ?? ""}`}
                                readOnly={!canEdit} onChange={onAcronymChanged}
                                invalid={touched.acronym && !!errors.acronym} invalidText={t2(errors.acronym)}
                                labelText={t('stockmanagement.stockitem.edit.abbreviation')} />
                        }
                        <div style={{ display: "grid", gridTemplateColumns: ".5fr .5fr" }}>
                            {
                                canEdit &&
                                <FormGroup className='clear-margin-bottom' legendText={t("stockmanagement.stockitem.edit.hasexpiration")} title={t("stockmanagement.stockitem.edit.hasexpiration")}
                                    invalid={touched.hasExpiration && !!errors.hasExpiration}>
                                    <RadioButtonGroup name="hasExpiration"
                                        defaultSelected={model.hasExpiration == null ? "" : model.hasExpiration.toString().toLowerCase()}
                                        legendText="" onChange={onHasExpirationChanged}  >
                                        <RadioButton value="true" id="hasExpiration-true" labelText={t("stockmanagement.yes")} />
                                        <RadioButton value="false" id="hasExpiration-false" labelText={t("stockmanagement.no")} />
                                    </RadioButtonGroup>
                                </FormGroup>
                            }

                            {!canEdit &&
                                <TextInput id="drugLbl" value={t(model.hasExpiration ? "stockmanagement.yes" : "stockmanagement.no")} readOnly={true}
                                    labelText={t('stockmanagement.stockitem.edit.hasexpiration')} />
                            }
                            <div style={model.hasExpiration ? {} : { visibility: "hidden" }}>
                                <NumberInput id="expiryNotice" name="expiryNotice" allowEmpty={true} readOnly={!canEdit}
                                    onChange={(e: any, d: any) => onExpiryNoticeChange(e)}
                                    value={model.expiryNotice ?? ""} label={t("stockmanagement.stockitem.edit.expirynotice")}
                                    invalid={touched.expiryNotice && !!errors.expiryNotice} invalidText={t2(errors.expiryNotice)}
                                />
                            </div>
                        </div>

                        {canEdit && (isFetchingStockSourceList || !stockSourceList || stockSourceList?.results.length === 0) && <SelectSkeleton hideLabel />}
                        {
                            canEdit && !(isFetchingStockSourceList || !stockSourceList || stockSourceList?.results.length === 0) && <>
                                <ComboBox titleText={t('stockmanagement.stockitem.edit.preferredvendor')}
                                    invalid={touched.preferredVendorUuid && !!errors.preferredVendorUuid} invalidText={t2(errors.preferredVendorUuid)}
                                    name='preferredVendorUuid' className='select-field' id="preferredVendorUuid"
                                    items={(stockSourceList?.results?.filter(x => x.uuid != null) ?? []) as any}
                                    onChange={onPreferredVendorChange}
                                    initialSelectedItem={stockSourceList?.results?.find(p => p.uuid === model.preferredVendorUuid)}
                                    itemToString={item => item ? `${item?.name}` : ""}
                                    shouldFilterItem={(data) => true}
                                    placeholder={t("stockmanagement.stockitem.edit.vendorholder")} />
                            </>
                        }
                        {
                            !canEdit &&
                            <TextInput id="preferredVendorUuidLbl" value={model?.preferredVendorName ?? ""}
                                readOnly={true}
                                labelText={t("stockmanagement.stockitem.edit.preferredvendor")} />
                        }

                        {canEdit && (isFetchingCategories || !categories) && <SelectSkeleton hideLabel />}
                        {
                            canEdit && !(isFetchingCategories || !categories) && <>
                                <ComboBox titleText={t('stockmanagement.stockitem.edit.category')}
                                    invalid={touched.categoryUuid && !!errors.categoryUuid} invalidText={t2(errors.categoryUuid)}
                                    name='categoryUuid' className='select-field' id="categoryUuid"
                                    items={(categories?.answers && categories?.answers.length > 0 ? categories?.answers : categories?.setMembers) as any ?? []}
                                    onChange={onCategoryChange}
                                    initialSelectedItem={(categories?.answers && categories?.answers.length > 0 ? categories?.answers : categories?.setMembers)?.find(p => p.uuid === model.categoryUuid) ?? {} as any}
                                    itemToString={item => item && item?.display ? `${item?.display}` : ""}
                                    shouldFilterItem={(data) => true}
                                    placeholder={t("stockmanagement.stockitem.edit.categoryholder")} />
                            </>
                        }
                        {
                            !canEdit &&
                            <TextInput id="categoryUuidLbl" value={model?.categoryName ?? ""}
                                readOnly={true}
                                labelText={t("stockmanagement.stockitem.edit.category")} />
                        }

                        {canEdit && model.isDrug && (isFetchingDispensingUnits || !dispensingUnits) && <SelectSkeleton hideLabel />}
                        {
                            canEdit && model.isDrug && !(isFetchingDispensingUnits || !dispensingUnits) && <>
                                <ComboBox titleText={t('stockmanagement.stockitem.edit.dispensingunit')}
                                    invalid={touched.dispensingUnitUuid && !!errors.dispensingUnitUuid} invalidText={t2(errors.dispensingUnitUuid)}
                                    name='dispensingUnitUuid' className='select-field' id="dispensingUnitUuid"
                                    items={(dispensingUnits?.answers && dispensingUnits?.answers.length > 0 ? dispensingUnits?.answers : dispensingUnits?.setMembers) as any ?? []}
                                    onChange={onDispensingUnitChange}
                                    initialSelectedItem={(dispensingUnits?.answers && dispensingUnits?.answers.length > 0 ? dispensingUnits?.answers : dispensingUnits?.setMembers)?.find(p => p.uuid === model.dispensingUnitUuid) ?? {} as any}
                                    itemToString={item => item && item?.display ? `${item?.display}` : ""}
                                    shouldFilterItem={(data) => true}
                                    placeholder={t("stockmanagement.stockitem.edit.dispensingunitholder")} />
                            </>
                        }
                        {
                            !canEdit && model.isDrug &&
                            <TextInput id="dispensingUnitUuidLbl" value={model?.dispensingUnitName ?? ""}
                                readOnly={true}
                                labelText={t("stockmanagement.stockitem.edit.dispensingunit")} />
                        }

                    </div>
                    <div>

                        {
                            !isNew && model.isDrug && canEdit && packagingUnits && packagingUnits.length > 0 &&
                            <Select invalid={touched.dispensingUnitPackagingUoMUuid && !!errors.dispensingUnitPackagingUoMUuid} invalidText={t2(errors.dispensingUnitPackagingUoMUuid)}
                                name='dispensingUnitPackagingUoMUuid' className='select-field' labelText={t('stockmanagement.stockitem.edit.dispensingunitpackaginguom')}
                                id="dispensingUnitPackagingUoMUuid" value={model.dispensingUnitPackagingUoMUuid ?? "placeholder-item"} onChange={onDispensingUnitPackagingUoMChange}>
                                <SelectItem disabled hidden value="placeholder-item" text={t("stockmanagement.stockitem.edit.choosepackaginguom")} />
                                {packagingUnits?.map(uom => {
                                    return <SelectItem key={uom.uuid} value={uom.uuid} text={uom.packagingUomName ?? ""} />
                                })}
                            </Select>
                        }
                        {
                            !isNew && model.isDrug && canEdit && (!packagingUnits || packagingUnits.length === 0) &&
                            <ToastNotification kind='warning-alt' hideCloseButton={true} title={t("stockmanagement.stockitem.edit.dispensingunitpackaginguom")}
                                subtitle={t("stockmanagement.stockitem.edit.nopackaginguomsubtitle")}
                                notificationType={'inline'}
                                caption="" style={{ minWidth: '30rem', marginBottom: '.5rem' }} />
                        }

                        {
                            !isNew && model.isDrug && !canEdit &&
                            <TextInput id="dispensingUnitPackagingUoMUuidLbl" value={model?.dispensingUnitPackagingUoMName ?? ""}
                                readOnly={true}
                                labelText={t("stockmanagement.stockitem.edit.dispensingunitpackaginguom")} />
                        }

                        {
                            !isNew && canEdit && packagingUnits && packagingUnits.length > 0 &&
                            <Select invalid={touched.defaultStockOperationsUoMUuid && !!errors.defaultStockOperationsUoMUuid} invalidText={t2(errors.defaultStockOperationsUoMUuid)}
                                name='defaultStockOperationsUoMUuid' className='select-field' labelText={t('stockmanagement.stockitem.edit.defaultstockoperationsuom')}
                                id="defaultStockOperationsUoMUuid" value={model.defaultStockOperationsUoMUuid ?? "placeholder-item"} onChange={onDefaultStockOperationsUoMChange}>
                                <SelectItem disabled hidden value="placeholder-item" text={t("stockmanagement.stockitem.edit.choosepackaginguom")} />
                                {packagingUnits?.map(uom => {
                                    return <SelectItem key={uom.uuid} value={uom.uuid} text={uom.packagingUomName ?? ""} />
                                })}
                            </Select>
                        }
                        {
                            !isNew && canEdit && (!packagingUnits || packagingUnits.length === 0) &&
                            <ToastNotification kind='warning-alt' hideCloseButton={true} title={t("stockmanagement.stockitem.edit.defaultstockoperationsuom")}
                                subtitle={t("stockmanagement.stockitem.edit.nopackaginguomsubtitle")}
                                notificationType={'inline'}
                                caption="" style={{ minWidth: '30rem', marginBottom: '.5rem' }} />
                        }

                        {
                            !isNew && !canEdit &&
                            <TextInput id="defaultStockOperationsUoMUuidLbl" value={model?.defaultStockOperationsUoMName ?? ""}
                                readOnly={true}
                                labelText={t("stockmanagement.stockitem.edit.defaultstockoperationsuom")} />
                        }

                        {
                            !isNew && !(!packagingUnits || packagingUnits.length === 0) &&
                            <NumberInput id="reorderLevel" name="reorderLevel" allowEmpty={true} readOnly={!canEdit}
                                onChange={(e: any, d: any) => onReorderLevelChange(e)}
                                value={model.reorderLevel ?? ""} label={t("stockmanagement.stockitem.edit.reorderlevel")}
                                invalid={touched.reorderLevel && !!errors.reorderLevel} invalidText={t2(errors.reorderLevel)}
                            />
                        }

                        {
                            !isNew && canEdit && packagingUnits && packagingUnits.length > 0 &&
                            <Select invalid={touched.reorderLevelUoMUuid && !!errors.reorderLevelUoMUuid} invalidText={t2(errors.reorderLevelUoMUuid)}
                                name='reorderLevelUoMUuid' className='select-field' labelText={t('stockmanagement.stockitem.edit.reorderleveluom')}
                                id="reorderLevelUoMUuid" value={model.reorderLevelUoMUuid ?? "placeholder-item"} onChange={onReorderLevelUoMChange}>
                                <SelectItem value="placeholder-item" text={t("stockmanagement.notset")} />
                                {packagingUnits?.map(uom => {
                                    return <SelectItem key={uom.uuid} value={uom.uuid} text={uom.packagingUomName ?? ""} />
                                })}
                            </Select>
                        }
                        {
                            !isNew && canEdit && (!packagingUnits || packagingUnits.length === 0) &&
                            <ToastNotification kind='warning-alt' hideCloseButton={true} title={t("stockmanagement.stockitem.edit.reorderleveluom")}
                                subtitle={t("stockmanagement.stockitem.edit.nopackaginguomsubtitle")}
                                notificationType={'inline'}
                                caption="" style={{ minWidth: '30rem', marginBottom: '.5rem' }} />
                        }

                        {
                            !isNew && !canEdit &&
                            <TextInput id="reorderLevelUoMUuidLbl" value={model?.reorderLevelUoMName ?? ""}
                                readOnly={true}
                                labelText={t("stockmanagement.stockitem.edit.reorderleveluom")} />
                        }

                        {
                            !isNew && !(!packagingUnits || packagingUnits.length === 0) &&
                            <NumberInput id="purchasePrice" name="purchasePrice" allowEmpty={true} readOnly={!canEdit}
                                onChange={(e: any, d: any) => onPurchasePriceChange(e)}
                                value={model.purchasePrice ?? ""} label={t("stockmanagement.stockitem.edit.purchaseprice")}
                                invalid={touched.purchasePrice && !!errors.purchasePrice} invalidText={t2(errors.purchasePrice)}
                            />
                        }

                        {
                            !isNew && canEdit && packagingUnits && packagingUnits.length > 0 &&
                            <Select invalid={touched.purchasePriceUoMUuid && !!errors.purchasePriceUoMUuid} invalidText={t2(errors.purchasePriceUoMUuid)}
                                name='purchasePriceUoMUuid' className='select-field' labelText={t('stockmanagement.stockitem.edit.purchasepriceuom')}
                                id="purchasePriceUoMUuid" value={model.purchasePriceUoMUuid ?? "placeholder-item"} onChange={onPurchasePriceUoMChange}>
                                <SelectItem value="placeholder-item" text={t("stockmanagement.notset")} />
                                {packagingUnits?.map(uom => {
                                    return <SelectItem key={uom.uuid} value={uom.uuid} text={uom.packagingUomName ?? ""} />
                                })}
                            </Select>
                        }
                        {
                            !isNew && canEdit && (!packagingUnits || packagingUnits.length === 0) &&
                            <ToastNotification kind='warning-alt' hideCloseButton={true} title={t("stockmanagement.stockitem.edit.purchasepriceuom")}
                                subtitle={t("stockmanagement.stockitem.edit.nopackaginguomsubtitle")}
                                notificationType={'inline'}
                                caption="" style={{ minWidth: '30rem', marginBottom: '.5rem' }} />
                        }

                        {
                            !isNew && !canEdit &&
                            <TextInput id="purchasePriceUoMUuidLbl" value={model?.purchasePriceUoMName ?? ""}
                                readOnly={true}
                                labelText={t("stockmanagement.stockitem.edit.purchasepriceuom")} />
                        }
                    </div>
                </div>
                {
                    canEdit &&
                    <div className='stkpg-form-buttons'>
                        {!isSubmitting && <>
                            <Button name="save" type="submit" disabled={disableSaveButton} className="submitButton" onClick={handleSave} kind="primary" renderIcon={Save24}>{t("stockmanagement.save")}</Button>
                            <Button type="button" className="cancelButton" kind="tertiary" onClick={actions.onGoBack} renderIcon={Undo24}>{t("stockmanagement.goback")}</Button>
                        </>
                        }
                    </div>
                }
            </Form>
        )}
    </Formik>
};