import { Save24, TrashCan16, Undo24 } from '@carbon/icons-react';
import {
    Button,
    ComboBox,
    DataTable,
    DataTableSkeleton,
    NumberInput,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableHeader,
    TableRow,
} from 'carbon-components-react';
import { produce } from "immer";
import React, { useEffect, useState } from 'react';
import styles from '../../root.module.scss';
import { PACKAGING_UNITS_CODED_CONCEPT_ID } from '../constants';
import { useLazyGetConceptByIdQuery } from '../core/api/lookups';
import { Concept } from '../core/api/types/concept/Concept';
import { StockItemPackagingUOMDTO } from '../core/api/types/stockItem/StockItemPackagingUOM';
import { errorAlert } from '../core/utils/alert';
import { isDesktopLayout, useLayoutType } from '../core/utils/layoutUtils';
import { getStockOperationUniqueId, toErrorMessage } from '../core/utils/stringUtils';
import useTranslation from '../core/utils/translation';


interface StockOperationItemTableProps {
    items: StockItemPackagingUOMDTO[];
    canEdit: boolean;
    setPackagingUnits: React.Dispatch<React.SetStateAction<StockItemPackagingUOMDTO[]>>;    
    actions: {
        onGoBack: () => void;
        onSave: () => void;
        onRemoveItem: (itemDto: StockItemPackagingUOMDTO) => void;
    },
    setSelectedTab: React.Dispatch<React.SetStateAction<number>>;
    errors: { [key: string]: { [key: string]: boolean } };
    setItemValidity: React.Dispatch<React.SetStateAction<{ [key: string]: { [key: string]: boolean } }>>;
    validateItems: () => boolean;
}

const handleErrors = (payload: any) => {
    var errorMessage = toErrorMessage(payload);
    errorAlert(`${errorMessage}`);
    return;
  }

const StockOperationItemsTable: React.FC<StockOperationItemTableProps> = ({
    items,
    canEdit,
    actions,
    setPackagingUnits,
    setSelectedTab,
    errors,
    setItemValidity,
    validateItems
}) => {
    const { t } = useTranslation();
    const isDesktop = isDesktopLayout(useLayoutType());
    const [conceptPackagingUnits, setconceptPackagingUnits] = useState<Concept[]>([]);
    const [getConcept, { data: concept, isFetching: isFetchingConcept }] = useLazyGetConceptByIdQuery();

    useEffect(() => {
        async function loadLookups() {
            if (canEdit) {                
                if (!concept) {
                    await getConcept(PACKAGING_UNITS_CODED_CONCEPT_ID).unwrap()
                    .then((payload: any) => {
                      if ((payload as any).error) {
                        handleErrors(payload);
                        return;
                      }
                      let pkgUnits = payload as Concept;
                      setconceptPackagingUnits(pkgUnits?.answers && pkgUnits?.answers.length > 0 ? pkgUnits?.answers : pkgUnits?.setMembers);
                    })
                    .catch((error: any) => handleErrors(error));
                }
            }
        }
        loadLookups();

    }, [canEdit, concept, getConcept]);

    
    const onPackagingUnitChanged = (row: StockItemPackagingUOMDTO, data: { selectedItem: any }) => {        
        setPackagingUnits(
            produce((draft) => {
                const item = draft.find((p) => p.uuid === row.uuid);
                if (item) {
                    if (data.selectedItem) {
                        item.packagingUomName = data.selectedItem?.display;
                        item.packagingUomUuid = data.selectedItem?.uuid;                        
                        if (item.uuid === items[items.length - 1].uuid) {
                            let itemId = `new-item-${getStockOperationUniqueId()}`;
                            draft.push({ uuid: itemId, id: itemId } as StockItemPackagingUOMDTO);
                        }
                    }
                    else {
                        item.packagingUomName = data.selectedItem?.display;
                        item.packagingUomUuid = data.selectedItem?.uuid;      
                    }
                }
            })
        );

        setItemValidity(produce((draft) => {
            if (!(row.uuid! in draft)) draft[row.uuid!] = {};
            draft[row.uuid!]["packagingUomUuid"] = true;
        }));
    }

    const onFactorFieldChange = (row: StockItemPackagingUOMDTO, value: string | number) => {
        try {
            let qtyValue: number | null = null;
            if (typeof value === 'number') {
                qtyValue = value;
            } else {
                qtyValue = value && value.length > 0 ? parseFloat(value) : null;
            }
            setPackagingUnits(
                produce((draft) => {
                    const item = draft.find((p) => p.uuid === row.uuid);
                    if (item) {
                        item.factor = qtyValue;
                        if (item.uuid === draft[draft.length - 1].uuid) {
                            let itemId = `new-item-${getStockOperationUniqueId()}`;
                            draft.push({ uuid: itemId, id: itemId } as StockItemPackagingUOMDTO);
                        }
                    }
                })
            );
        } catch (e) {
            console.log(e);
        }

        setItemValidity(produce((draft) => {
            if (!(row.uuid! in draft)) draft[row.uuid!] = {};
            draft[row.uuid!]["factor"] = true;
        }));
    }

    const headers = [
        { key: 'packingunit', header: t('stockmanagement.stockitem.units.packingunit'), styles: { width: "20%" } },      
        { key: 'quantity', header: t('stockmanagement.stockitem.units.factor'), styles: { width: "10%" } }        
    ];

    const onRemoveItem = (item: StockItemPackagingUOMDTO, event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        if (item.uuid?.startsWith("new-item")) {
            let itemId = item.uuid;
            if (itemId === items[items.length - 1].uuid) {
                return;
            }
            setPackagingUnits(
                produce((draft) => {
                    const itemIndex = draft.findIndex((p) => p.uuid === itemId);
                    if (itemIndex >= 0) {
                        draft.splice(itemIndex, 1);
                    }
                })
            );
        } else {
            actions.onRemoveItem(item);
        }
    }

    const onGoBack = (event: React.MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        actions.onGoBack();
    }

    const handleSave = async () => {
        try {
            actions.onSave();
        } finally {
        }
    }

    if(canEdit && (isFetchingConcept || !conceptPackagingUnits || conceptPackagingUnits.length === 0)){
        return <DataTableSkeleton className={styles.dataTableSkeleton} showHeader={false} rowCount={5} columnCount={5} zebra />;
    }   

    return <>
        <div className={`${styles.tableOverride} stkpg-operation-items`}>
            <DataTable rows={items as any} headers={headers} isSortable={false} useZebraStyles={true}
                render={({ rows, headers, getHeaderProps, getTableProps, getRowProps, getSelectionProps, getBatchActionProps, selectedRows }) => (
                    <TableContainer>
                        <Table {...getTableProps()}>
                            <TableHead>
                                <TableRow>
                                    {headers.map((header: any, index) => (
                                        <TableHeader
                                            {...getHeaderProps({
                                                header,
                                                isSortable: false,
                                            })}

                                            className={isDesktop ? styles.desktopHeader : styles.tabletHeader}
                                            style={header?.styles}
                                            key={`${header.key}`}>
                                            {header.header?.content ?? header.header}
                                        </TableHeader>
                                    ))}
                                    {canEdit && <TableHeader style={{ width: "70%" }}></TableHeader>}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {items.map((row: any, rowIndex) => {
                                    return (
                                        <TableRow
                                            className={isDesktop ? styles.desktopRow : styles.tabletRow}
                                            key={row.uuid}>
                                            <TableCell>
                                                {
                                                    canEdit && row.uuid.startsWith('new-item') && <>
                                                        <ComboBox size='sm' titleText="" id={`item-${row.uuid}`}
                                                            initialSelectedItem={(row?.packagingUomUuid) ? {
                                                                uuid: row?.packagingUomUuid,
                                                                display: row?.packagingUomName
                                                            } as any : null}
                                                            selectedItem={row?.packagingUomUuid ? {
                                                                uuid: row?.packagingUomUuid,
                                                                display: row?.packagingUomName
                                                            } : null}
                                                            items={row?.packagingUomUuid ? [...(conceptPackagingUnits.some(x => x.uuid === row?.packagingUomUuid) ? [] : [{ uuid: row?.packagingUomUuid, display: row?.packagingUomName }]), ...(conceptPackagingUnits ?? [])] : conceptPackagingUnits}
                                                            onChange={(data: { selectedItem: any }) => onPackagingUnitChanged(row, data)}
                                                            shouldFilterItem={(data) => true}
                                                            itemToString={item => item?.display }
                                                            placeholder={'Filter...'}
                                                            invalid={(row.uuid in errors) && ("packagingUomUuid" in errors[row.uuid]) && !errors[row.uuid]["packagingUomUuid"]}
                                                        /></>
                                                }
                                                {(!canEdit || !row.uuid.startsWith('new-item')) && row?.packagingUomName}
                                            </TableCell>
                                            <TableCell>
                                                {canEdit && <NumberInput size='sm' id={`qty-${row.uuid}`} allowEmpty={true}
                                                    onChange={(e: any, d: any) => onFactorFieldChange(row, e?.target?.value)}
                                                    value={row?.factor ?? ""} title=""
                                                    invalidText=""
                                                    invalid={(row.uuid in errors) && ("factor" in errors[row.uuid]) && !errors[row.uuid]["factor"]}
                                                />}
                                                {!canEdit && row?.factor?.toLocaleString()}
                                            </TableCell>
                                            {canEdit && <TableCell>
                                                <Button type="button" size="sm" className="submitButton clear-padding-margin" iconDescription={"Delete"} kind="ghost" renderIcon={TrashCan16} onClick={(e) => onRemoveItem(row, e)} />
                                            </TableCell>}
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            >
            </DataTable>
            <div className="table-bottom-border"></div>
        </div>
        {canEdit &&
            <div className='stkpg-form-buttons'>
                <Button name="save" type="submit" className="submitButton" onClick={handleSave} kind="primary" renderIcon={Save24}>{t("stockmanagement.save")}</Button>
                <Button type="button" className="cancelButton" kind="tertiary" onClick={onGoBack} renderIcon={Undo24}>{t("stockmanagement.goback")}</Button>
            </div>
        }
    </>;
};

export default StockOperationItemsTable;
