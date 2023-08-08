import {
  Button,
  DataTable,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from "carbon-components-react";
import React from "react";
import { Link } from "react-router-dom";
import styles from "../../root.module.scss";
import { StockOperationItemDTO } from "../core/api/types/stockOperation/StockOperationItemDTO";
import { formatForDatePicker } from "../core/utils/datetimeUtils";
import { isDesktopLayout, useLayoutType } from "../core/utils/layoutUtils";
import useTranslation from "../core/utils/translation";

import { Undo24 } from "@carbon/icons-react";
import { URL_STOCK_ITEM } from "../constants";

interface ReceiveItemTableProps {
  items: StockOperationItemDTO[];
  canReceiveItems: boolean;
  locked: boolean;
  setStockOperationItems: React.Dispatch<
    React.SetStateAction<StockOperationItemDTO[]>
  >;
  isNegativeQtyAllowed: boolean;
  actions: {
    onGoBack: () => void;
    onSaveReceivedItems: () => void;
  };
  errors: { [key: string]: { [key: string]: boolean } };
  setItemValidity: React.Dispatch<
    React.SetStateAction<{ [key: string]: { [key: string]: boolean } }>
  >;
  validateReceivedItems: () => boolean;
}

const ReceiveItemsTable: React.FC<ReceiveItemTableProps> = ({
  items,
  canReceiveItems,
  locked,
  setStockOperationItems,
  actions,
  errors,
  setItemValidity,
  validateReceivedItems,
}) => {
  const { t } = useTranslation();
  const isDesktop = isDesktopLayout(useLayoutType());
  // const onQuantityUomFieldSelectionChanged = useCallback((row: StockOperationItemDTO, evt: ChangeEvent<HTMLSelectElement>) => {
  //     let selectedUom = evt.target.value;
  //     let rowUuid = row.uuid;
  //     setStockOperationItems(
  //         produce((draft) => {
  //             const item = draft.find((p) => p.uuid === rowUuid);
  //             if (item) {
  //                 let selectedPackagingUnit = row.packagingUnits?.find(x => x.uuid === selectedUom);
  //                 item.quantityReceivedPackagingUOMName = selectedPackagingUnit?.packagingUomName;
  //                 item.quantityReceivedPackagingUOMUuid = selectedPackagingUnit?.uuid;
  //             }
  //         })
  //     );
  //     setItemValidity(produce((draft) => {
  //         if (!(row.uuid! in draft)) draft[row.uuid!] = {};
  //         draft[row.uuid!]["quantityReceivedPackagingUOMUuid"] = true;
  //     }));
  // }, [setItemValidity, setStockOperationItems])

  // const onQuantityFieldChange = (row: StockOperationItemDTO, value: string | number) => {
  //     try {
  //         let qtyValue: number | null = null;
  //         if (typeof value === 'number') {
  //             qtyValue = value;
  //         } else {
  //             qtyValue = value && value.length > 0 ? parseFloat(value) : null;
  //         }
  //         setStockOperationItems(
  //             produce((draft) => {
  //                 const item = draft.find((p) => p.uuid === row.uuid);
  //                 if (item) {
  //                     item.quantityReceived = qtyValue;
  //                 }
  //             })
  //         );
  //     } catch (e) {
  //         console.log(e);
  //     }

  //     setItemValidity(produce((draft) => {
  //         if (!(row.uuid! in draft)) draft[row.uuid!] = {};
  //         draft[row.uuid!]["quantity"] = true;
  //     }));
  // }

  const headers = [
    {
      key: "item",
      header: t("stockmanagement.stockoperation.items.item"),
      styles: { width: "40%" },
    },
    {
      key: "quantityrequested",
      header: t("stockmanagement.stockoperation.items.quantityrequested"),
      styles: { width: "8%" },
    },
    {
      key: "batch",
      header: t("stockmanagement.stockoperation.items.batch"),
      styles: { width: "15%" },
    },
    {
      key: "expiry",
      header: t("stockmanagement.stockoperation.items.expiry"),
      styles: { width: "8%" },
    },
    {
      key: "sentquantity",
      header: t("stockmanagement.stockoperation.items.sentquantity"),
      styles: { width: "10%" },
    },
    {
      key: "quantityreceived",
      header: t("stockmanagement.stockoperation.items.quantityreceived"),
      styles: { width: "8%", whiteSpace: "nowrap" },
    },
    {
      key: "quantityreceiveduom",
      header: t("stockmanagement.stockoperation.items.quantityreceiveduom"),
      styles: { width: "15%" },
    },
  ];

  const onGoBack = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    actions.onGoBack();
  };

  // const handleSave = async () => {
  //     try {
  //         actions.onSaveReceivedItems();
  //     } finally {
  //     }
  // }

  return (
    <>
      <div className={`${styles.tableOverride} stkpg-operation-items`}>
        <DataTable
          rows={items as any}
          headers={headers}
          isSortable={false}
          useZebraStyles={true}
          render={({
            rows,
            headers,
            getHeaderProps,
            getTableProps,
            getRowProps,
            getSelectionProps,
            getBatchActionProps,
            selectedRows,
          }) => (
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
                        className={
                          isDesktop ? styles.desktopHeader : styles.tabletHeader
                        }
                        style={header?.styles}
                        key={`${header.key}`}
                      >
                        {header.header?.content ?? header.header}
                      </TableHeader>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((row: any, rowIndex) => {
                    return (
                      <TableRow
                        className={
                          isDesktop ? styles.desktopRow : styles.tabletRow
                        }
                        key={row.uuid}
                      >
                        <TableCell>
                          <Link
                            target={"_blank"}
                            to={URL_STOCK_ITEM(row?.stockItemUuid!)}
                          >{`${row?.stockItemName}`}</Link>
                        </TableCell>
                        <TableCell>
                          {row?.quantityRequested?.toLocaleString() ?? ""}{" "}
                          {row?.quantityRequestedPackagingUOMName ?? ""}
                        </TableCell>
                        <TableCell>{row?.batchNo}</TableCell>
                        <TableCell>
                          {formatForDatePicker(row?.expiration)}
                        </TableCell>
                        <TableCell>
                          {row?.quantity?.toLocaleString()}{" "}
                          {row?.stockItemPackagingUOMName}
                        </TableCell>
                        <TableCell>
                          {/* {canReceiveItems && <NumberInput size='sm' id={`qty-${row.uuid}`} allowEmpty={false}
                                                    onChange={(e: any, d: any) => onQuantityFieldChange(row, e?.target?.value)}
                                                    value={row?.quantityReceived ?? ""} title=""
                                                    invalidText=""
                                                    invalid={(row.uuid in errors) && ("quantityReceived" in errors[row.uuid]) && !errors[row.uuid]["quantityReceived"]}
                                                />}
                                                {!canReceiveItems && row?.quantityReceived?.toLocaleString()} */}
                          {row?.quantityReceived?.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {/* {canReceiveItems &&

                                                    <Select 
                                                        invalid={(row.uuid in errors) && ("quantityReceivedPackagingUOMUuid" in errors[row.uuid]) && !errors[row.uuid]["quantityReceivedPackagingUOMUuid"]}
                                                        size='sm' className='select-field' labelText=""
                                                        id={`quantityuom-${row.uuid}`} value={row?.quantityReceivedPackagingUOMUuid ?? "placeholder-item"} onChange={(e)=>onQuantityUomFieldSelectionChanged(row,e)}>
                                                        <SelectItem disabled hidden value="placeholder-item" text={t("stockmanagement.stockoperation.edit.qtyuomplaceholder")} />
                                                        {(row?.packagingUnits as StockItemPackagingUOMDTO[])?.map(uom => {
                                                            return <SelectItem key={uom.uuid} value={uom.uuid} text={uom.packagingUomName ?? ""} />
                                                        })}
                                                    </Select>
                                                }
                                                {!canReceiveItems && row?.quantityReceivedPackagingUOMName} */}
                          {row?.quantityReceivedPackagingUOMName}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        ></DataTable>
        <div className="table-bottom-border"></div>
      </div>
      {canReceiveItems && locked && (
        <div className="stkpg-form-buttons">
          {/* <Button name="save" type="submit" className="submitButton" onClick={handleSave} kind="primary" renderIcon={Save24}>{t("stockmanagement.save")}</Button> */}
          <Button
            type="button"
            className="cancelButton"
            kind="tertiary"
            onClick={onGoBack}
            renderIcon={Undo24}
          >
            {t("stockmanagement.goback")}
          </Button>
        </div>
      )}
    </>
  );
};

export default ReceiveItemsTable;
