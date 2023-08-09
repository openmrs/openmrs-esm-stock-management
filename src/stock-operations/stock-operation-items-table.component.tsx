import { ArrowRight24, Save24, Undo24 } from "@carbon/icons-react";
import {
  Button,
  ComboBox,
  DataTable,
  DatePicker,
  DatePickerInput,
  NumberInput,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  TextInput,
} from "@carbon/react";
import { produce } from "immer";
import debounce from "lodash-es/debounce";
import React, { useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import styles from "../../root.module.scss";
import { URL_STOCK_ITEM } from "../constants";
import { ResourceRepresentation } from "../core/api/api";
import {
  StockItemFilter,
  useLazyGetStockBatchesQuery,
  useLazyGetStockItemInventoryQuery,
  useLazyGetStockItemPackagingUOMsQuery,
  useLazyGetStockItemsQuery,
} from "../core/api/stockItem";
import { StockBatchDTO } from "../core/api/types/stockItem/StockBatchDTO";
import { StockItemDTO } from "../core/api/types/stockItem/StockItem";
import { StockItemInventory } from "../core/api/types/stockItem/StockItemInventory";
import { StockItemPackagingUOMDTO } from "../core/api/types/stockItem/StockItemPackagingUOM";
import { StockOperationItemDTO } from "../core/api/types/stockOperation/StockOperationItemDTO";
import { errorAlert } from "../core/utils/alert";
import {
  DATE_PICKER_CONTROL_FORMAT,
  DATE_PICKER_FORMAT,
  ParseDate,
  formatForDatePicker,
  today,
} from "../core/utils/datetimeUtils";
import { isDesktopLayout, useLayoutType } from "../core/utils/layoutUtils";
import {
  getStockOperationUniqueId,
  toErrorMessage,
} from "../core/utils/stringUtils";
import useTranslation from "../core/utils/translation";

interface StockOperationItemTableProps {
  items: StockOperationItemDTO[];
  canEdit: boolean;
  locked: boolean;
  addItem: () => void;
  setStockOperationItems: React.Dispatch<
    React.SetStateAction<StockOperationItemDTO[]>
  >;
  isNegativeQtyAllowed: boolean;
  requiresBatchUuid: boolean;
  requiresActualBatchInformation: boolean;
  isQuantityOptional: boolean;
  canCapturePurchasePrice: boolean;
  setShowComplete: React.Dispatch<React.SetStateAction<boolean>>;
  actions: {
    onGoBack: () => void;
    onSave: () => void;
    onRemoveItem: (itemDto: StockOperationItemDTO) => void;
    onBatchInfoSave: () => void;
  };
  setSelectedTab: React.Dispatch<React.SetStateAction<number>>;
  errors: { [key: string]: { [key: string]: boolean } };
  setItemValidity: React.Dispatch<
    React.SetStateAction<{ [key: string]: { [key: string]: boolean } }>
  >;
  validateItems: () => boolean;
  showQuantityRequested?: boolean;
  allowExpiredBatchNumbers: boolean;
  canUpdateBatchInformation: boolean;
  atLocation: string | null | undefined;
  batchBalance: { [key: string]: StockItemInventory };
  setBatchBalance: React.Dispatch<
    React.SetStateAction<{ [key: string]: StockItemInventory }>
  >;
}

const minDate: Date = today();

const StockOperationItemsTable: React.FC<StockOperationItemTableProps> = ({
  items,
  addItem,
  canEdit,
  locked,
  setStockOperationItems,
  isNegativeQtyAllowed,
  requiresBatchUuid,
  requiresActualBatchInformation,
  isQuantityOptional,
  canCapturePurchasePrice,
  setShowComplete,
  actions,
  setSelectedTab,
  errors,
  setItemValidity,
  validateItems,
  showQuantityRequested,
  allowExpiredBatchNumbers,
  canUpdateBatchInformation,
  atLocation,
  batchBalance,
  setBatchBalance,
}) => {
  const { t } = useTranslation();
  const isDesktop = isDesktopLayout(useLayoutType());
  const [stockItems, setStockItems] = useState<StockItemDTO[]>([]);
  const [itemUoM, setItemUoM] = useState<{
    [key: string]: StockItemPackagingUOMDTO[];
  }>({});
  const [noItemUoM, setNoItemUoM] = useState<{ [key: string]: boolean }>({});
  const [itemBatchNos, setItemBatchNos] = useState<{
    [key: string]: StockBatchDTO[];
  }>({});
  const [noItemBatchNos, setNoItemBatchNos] = useState<{
    [key: string]: boolean;
  }>({});
  const [getStockItems] = useLazyGetStockItemsQuery();
  const [getStockItemInventory] = useLazyGetStockItemInventoryQuery();
  const [getStockItemPackagingUOMs] = useLazyGetStockItemPackagingUOMsQuery();
  const [getStockBatchesQuery] = useLazyGetStockBatchesQuery();

  const onStockItemChanged = (
    row: StockOperationItemDTO,
    data: { selectedItem: any }
  ) => {
    setShowComplete(false);
    setStockOperationItems(
      produce((draft) => {
        const item = draft.find((p) => p.uuid === row.uuid);
        if (item) {
          if (data.selectedItem) {
            item.stockItemName =
              data.selectedItem?.display ??
              (data.selectedItem?.drugName
                ? `${data.selectedItem?.drugName}${
                    data.selectedItem?.commonName ??
                    data.selectedItem?.conceptName
                      ? ` (${
                          data.selectedItem?.commonName ??
                          data.selectedItem?.conceptName
                        })`
                      : ""
                  }`
                : null) ??
              data.selectedItem?.conceptName;

            let configureExpiration = data.selectedItem?.hasExpiration ?? true;
            item.hasExpiration = configureExpiration;
            if (!configureExpiration) {
              item.expiration = null;
            }

            item.stockItemUuid = data.selectedItem?.uuid;

            item.stockItemPackagingUOMUuid = null;
            item.stockItemPackagingUOMName = null;

            item.stockBatchUuid = null;
            handleStockItemPackagingUoMsSearch(
              row,
              "",
              data.selectedItem?.uuid
            );
            if (requiresBatchUuid) {
              handleStockBatchSearch(row, "", data.selectedItem?.uuid);
            }
            if (item.uuid === items[items.length - 1].uuid) {
              let itemId = `new-item-${getStockOperationUniqueId()}`;
              draft.push({ uuid: itemId, id: itemId });
            }
          } else {
            item.stockItemName = null;
            item.stockItemUuid = null;
            item.stockItemPackagingUOMUuid = null;
            item.stockItemPackagingUOMName = null;
            item.stockBatchUuid = null;
          }
        }
      })
    );

    setItemValidity(
      produce((draft) => {
        if (!(row.uuid! in draft)) draft[row.uuid!] = {};
        draft[row.uuid!]["stockItemUuid"] = true;
      })
    );
  };

  const hasItemsWithUpdateableBatchInfo = useMemo(() => {
    return (
      canUpdateBatchInformation &&
      items?.some((p) => p?.permission?.canUpdateBatchInformation)
    );
  }, [items, canUpdateBatchInformation]);

  const handleStockItemsSearch = useMemo(
    () =>
      debounce((row: any, searchTerm) => {
        if (row && row.stockItemName) {
          if (searchTerm === row.stockItemName) {
            return;
          }
        }

        getStockItems({
          startIndex: 0,
          v: ResourceRepresentation.Default,
          limit: 10,
          q: searchTerm,
          totalCount: true,
          isDrug: null,
        } as any as StockItemFilter)
          .unwrap()
          .then((payload: any) => {
            if ((payload as any).error) {
              var errorMessage = toErrorMessage(payload);
              errorAlert(`Search failed ${errorMessage}`);
              return;
            } else {
              setStockItems(payload?.results as StockItemDTO[]);
            }
          })
          .catch((error) => {
            var errorMessage = toErrorMessage(error);
            errorAlert(`Search failed ${errorMessage}`);
            return;
          });
      }, 300),
    [getStockItems]
  );

  const handleBatchBalanceSearch = useMemo(
    () =>
      debounce(
        (
          stockItemUuid: string | null | undefined,
          stockBatchUuid: string | null | undefined
        ) => {
          if (
            !stockItemUuid ||
            !atLocation ||
            !stockBatchUuid ||
            stockBatchUuid in batchBalance
          ) {
            return;
          }
          getStockItemInventory({
            stockItemUuid: stockItemUuid,
            locationUuid: atLocation,
            stockBatchUuid: stockBatchUuid,
            startIndex: 0,
            v: ResourceRepresentation.Default,
            groupBy: "LocationStockItemBatchNo",
            excludeExpired: !allowExpiredBatchNumbers,
          })
            .unwrap()
            .then((payload: any) => {
              if ((payload as any).error) {
                var errorMessage = toErrorMessage(payload);
                errorAlert(`Batch balance load failed ${errorMessage}`);
                return;
              } else {
                let inventory: StockItemInventory = (
                  payload?.results as StockItemInventory[]
                )?.[0];
                if (!inventory) {
                  inventory = {
                    quantity: 0,
                    quantityUoM: null,
                  } as any as StockItemInventory;
                }
                setBatchBalance(
                  produce((draft) => {
                    draft[stockBatchUuid] = inventory;
                  })
                );
              }
            })
            .catch((error) => {
              var errorMessage = toErrorMessage(error);
              errorAlert(`Batch balance load failed ${errorMessage}`);
              return;
            });
        },
        300
      ),
    [
      allowExpiredBatchNumbers,
      atLocation,
      batchBalance,
      getStockItemInventory,
      setBatchBalance,
    ]
  );

  const onQuantityUomFieldChanged = useCallback(
    (row: StockOperationItemDTO, data: { selectedItem: any }) => {
      setShowComplete(false);
      setStockOperationItems(
        produce((draft) => {
          const item = draft.find((p) => p.uuid === row.uuid);
          if (item) {
            item.stockItemPackagingUOMName =
              data.selectedItem?.display ?? data.selectedItem?.packagingUomName;
            item.stockItemPackagingUOMUuid = data.selectedItem?.uuid;
            if (item.uuid === draft[draft.length - 1].uuid) {
              let itemId = `new-item-${getStockOperationUniqueId()}`;
              draft.push({ uuid: itemId, id: itemId });
            }
          }
        })
      );
      setItemValidity(
        produce((draft) => {
          if (!(row.uuid! in draft)) draft[row.uuid!] = {};
          draft[row.uuid!]["stockItemPackagingUOMUuid"] = true;
        })
      );
    },
    [setItemValidity, setShowComplete, setStockOperationItems]
  );

  const handleStockItemPackagingUoMsSearch = useMemo(
    () =>
      debounce(
        (
          row: StockOperationItemDTO,
          searchTerm,
          stockItemUuidParam?: string
        ) => {
          const stockItemUuid = row.stockItemUuid ?? stockItemUuidParam;
          if (!stockItemUuid) return;
          if (stockItemUuid in itemUoM) {
            if (
              itemUoM[stockItemUuid].length === 0 &&
              !(stockItemUuid in noItemUoM)
            ) {
              setNoItemUoM(
                produce((draft) => {
                  draft[stockItemUuid] = true;
                })
              );
              errorAlert(t("stockmanagement.nopackagingunitsdefined"));
            }
            return;
          }

          if (
            row &&
            row.stockItemPackagingUOMName &&
            searchTerm === row.stockItemPackagingUOMName
          )
            return;
          getStockItemPackagingUOMs({
            startIndex: 0,
            v: ResourceRepresentation.Default,
            limit: 100,
            q: searchTerm,
            stockItemUuid: stockItemUuid,
          })
            .unwrap()
            .then((payload: any) => {
              if ((payload as any).error) {
                var errorMessage = toErrorMessage(payload);
                errorAlert(`Load UoMs failed ${errorMessage}`);
                return;
              } else {
                setItemUoM(
                  produce((draft) => {
                    draft[stockItemUuid] =
                      payload?.results as StockItemPackagingUOMDTO[];
                  })
                );
              }
            })
            .catch((error) => {
              var errorMessage = toErrorMessage(error);
              errorAlert(`Load UoMs failed ${errorMessage}`);
              return;
            });
        },
        300
      ),
    [getStockItemPackagingUOMs, itemUoM, noItemUoM, t]
  );

  const handleStockBatchSearch = useMemo(
    () =>
      debounce(
        (
          row: StockOperationItemDTO,
          searchTerm,
          stockItemUuidParam?: string
        ) => {
          const stockItemUuid = row.stockItemUuid ?? stockItemUuidParam;
          if (!stockItemUuid) return;
          if (stockItemUuid in itemBatchNos) {
            if (
              itemBatchNos[stockItemUuid].length === 0 &&
              !(stockItemUuid in noItemBatchNos)
            ) {
              setNoItemBatchNos(
                produce((draft) => {
                  draft[stockItemUuid] = true;
                })
              );
              errorAlert(t("stockmanagement.nostockbatchesdefined"));
            }
            return;
          }

          if (row && row.batchNo && searchTerm === row.batchNo) return;

          getStockBatchesQuery({
            startIndex: 0,
            v: ResourceRepresentation.Default,
            limit: 100,
            q: searchTerm,
            stockItemUuid: stockItemUuid,
            excludeExpired: !allowExpiredBatchNumbers,
          })
            .unwrap()
            .then((payload: any) => {
              if ((payload as any).error) {
                var errorMessage = toErrorMessage(payload);
                errorAlert(`Load stock batch numbers failed ${errorMessage}`);
                return;
              } else {
                setItemBatchNos(
                  produce((draft) => {
                    draft[stockItemUuid] = payload?.results as StockBatchDTO[];
                  })
                );
              }
            })
            .catch((error) => {
              var errorMessage = toErrorMessage(error);
              errorAlert(`Load stock batch numbers failed ${errorMessage}`);
              return;
            });
        },
        300
      ),
    [
      getStockBatchesQuery,
      itemBatchNos,
      noItemBatchNos,
      t,
      allowExpiredBatchNumbers,
    ]
  );

  const onBatchNoChange = (
    row: any,
    evt: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (canEdit) {
      setShowComplete(false);
    }
    let newValue = evt.target.value;
    setStockOperationItems(
      produce((draft) => {
        const item = draft.find((p) => p.uuid === row.uuid);
        if (item) {
          item.batchNo = newValue;
          if (canEdit && item.uuid === draft[draft.length - 1].uuid) {
            let itemId = `new-item-${getStockOperationUniqueId()}`;
            draft.push({ uuid: itemId, id: itemId });
          }
        }
      })
    );

    setItemValidity(
      produce((draft) => {
        if (!(row.uuid! in draft)) draft[row.uuid!] = {};
        draft[row.uuid!]["batchNo"] = true;
      })
    );
  };

  const onExpirationDateChangeInput = (
    row: StockOperationItemDTO,
    date: string | null | undefined
  ): void => {
    let parsedDate = ParseDate(date);
    if (!parsedDate) {
      onExpirationDateChange(row, [null, null] as any as Date[], true);
      setItemValidity(
        produce((draft) => {
          if (!(row.uuid! in draft)) draft[row.uuid!] = {};
          draft[row.uuid!]["expiration"] = false;
        })
      );
    } else {
      onExpirationDateChange(
        row,
        [parsedDate, parsedDate] as any as Date[],
        true
      );
      setItemValidity(
        produce((draft) => {
          if (!(row.uuid! in draft)) draft[row.uuid!] = {};
          draft[row.uuid!]["expiration"] = true;
        })
      );
    }
  };

  const onExpirationDateChange = (
    row: StockOperationItemDTO,
    dates: Date[],
    skipValiditySet?: boolean
  ): void => {
    if (canEdit) {
      setShowComplete(false);
    }
    setStockOperationItems(
      produce((draft) => {
        const item = draft.find((p) => p.uuid === row.uuid);
        if (item) {
          item.expiration = dates[0];
          if (canEdit && item.uuid === draft[draft.length - 1].uuid) {
            let itemId = `new-item-${getStockOperationUniqueId()}`;
            draft.push({ uuid: itemId, id: itemId });
          }
        }
      })
    );
    if (!(skipValiditySet ?? false)) {
      setItemValidity(
        produce((draft) => {
          if (!(row.uuid! in draft)) draft[row.uuid!] = {};
          draft[row.uuid!]["expiration"] = true;
        })
      );
    }
  };

  const onQuantityFieldChange = (
    row: StockOperationItemDTO,
    value: string | number
  ) => {
    setShowComplete(false);
    try {
      let qtyValue: number | null = null;
      if (typeof value === "number") {
        qtyValue = value;
      } else {
        qtyValue = value && value.length > 0 ? parseFloat(value) : null;
      }
      setStockOperationItems(
        produce((draft) => {
          const item = draft.find((p) => p.uuid === row.uuid);
          if (item) {
            item.quantity = qtyValue;
            if (item.uuid === draft[draft.length - 1].uuid) {
              let itemId = `new-item-${getStockOperationUniqueId()}`;
              draft.push({ uuid: itemId, id: itemId });
            }
          }
        })
      );
    } catch (e) {
      console.log(e);
    }

    setItemValidity(
      produce((draft) => {
        if (!(row.uuid! in draft)) draft[row.uuid!] = {};
        draft[row.uuid!]["quantity"] = true;
      })
    );
  };

  const onPurchasePriceFieldChange = (
    row: StockOperationItemDTO,
    value: string | number
  ) => {
    setShowComplete(false);
    try {
      let price: number | null = null;
      if (typeof value == "number") {
        price = value;
      } else {
        price = value && value.length > 0 ? parseFloat(value) : null;
      }
      setStockOperationItems(
        produce((draft) => {
          const item = draft.find((p) => p.uuid === row.uuid);
          if (item) {
            item.purchasePrice = price;
            if (item.uuid === draft[draft.length - 1].uuid) {
              let itemId = `new-item-${getStockOperationUniqueId()}`;
              draft.push({ uuid: itemId, id: itemId });
            }
          }
        })
      );
    } catch (e) {
      console.log(e);
    }
    setItemValidity(
      produce((draft) => {
        if (!(row.uuid! in draft)) draft[row.uuid!] = {};
        draft[row.uuid!]["purchasePrice"] = true;
      })
    );
  };

  const onBatchUuidFieldChanged = (
    row: StockOperationItemDTO,
    data: { selectedItem: any }
  ) => {
    setShowComplete(false);
    setStockOperationItems(
      produce((draft) => {
        const item = draft.find((p) => p.uuid === row.uuid);
        if (item) {
          item.stockBatchUuid = data.selectedItem?.uuid;
          item.batchNo = data.selectedItem?.batchNo;
          item.expiration = data.selectedItem?.expiration;

          if (item.uuid === draft[draft.length - 1].uuid) {
            let itemId = `new-item-${getStockOperationUniqueId()}`;
            draft.push({ uuid: itemId, id: itemId });
          }
        }
      })
    );
    setItemValidity(
      produce((draft) => {
        if (!(row.uuid! in draft)) draft[row.uuid!] = {};
        draft[row.uuid!]["stockBatchUuid"] = true;
      })
    );
    handleBatchBalanceSearch(row?.stockItemUuid, data?.selectedItem?.uuid);
  };

  const headers = [
    {
      key: "item",
      header: t("stockmanagement.stockoperation.items.item"),
      styles: { width: "40%" },
    },
    ...(showQuantityRequested
      ? [
          {
            key: "quantityrequested",
            header: t("stockmanagement.stockoperation.items.quantityrequested"),
            styles: { width: "8%" },
          },
        ]
      : []),
    ...(requiresBatchUuid || requiresActualBatchInformation
      ? [
          {
            key: "batch",
            header: t("stockmanagement.stockoperation.items.batch"),
            styles: { width: "15%" },
          },
        ]
      : []),
    ...(requiresActualBatchInformation
      ? [
          {
            key: "expiry",
            header: t("stockmanagement.stockoperation.items.expiry"),
            styles: { width: "15%" },
          },
        ]
      : []),
    ...(requiresBatchUuid
      ? [
          {
            key: "expiry",
            header: t("stockmanagement.stockoperation.items.expiry"),
            styles: { width: "8%" },
          },
        ]
      : []),

    {
      key: "quantity",
      header: t(
        showQuantityRequested
          ? "stockmanagement.stockoperation.items.qtyissuied"
          : "stockmanagement.stockoperation.items.quantity"
      ),
      styles: { width: "8%" },
    },
    {
      key: "quantityuom",
      header: t("stockmanagement.stockoperation.items.quantityuom"),
      styles: { width: "15%" },
    },
    ...(canCapturePurchasePrice
      ? [
          {
            key: "purchaseprice",
            header: t("stockmanagement.stockoperation.items.purchaseprice"),
            classNastylesmes: { width: "10%" },
          },
        ]
      : []),
  ];

  const onRemoveItem = (
    item: StockOperationItemDTO,
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
    if (item.uuid?.startsWith("new-item")) {
      let itemId = item.uuid;
      if (itemId === items[items.length - 1].uuid) {
        return;
      }
      setStockOperationItems(
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
  };

  const onContinue = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    if (validateItems()) {
      setShowComplete(true);
      setSelectedTab(2);
    }
  };

  const onGoBack = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    actions.onGoBack();
  };

  const handleSave = async () => {
    try {
      actions.onSave();
    } finally {
    }
  };

  const handleBatchInfoSave = async () => {
    try {
      actions.onBatchInfoSave();
    } finally {
    }
  };

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
                    {canEdit && (
                      <TableHeader style={{ width: "3%" }}></TableHeader>
                    )}
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
                          {canEdit && row.uuid.startsWith("new-item") && (
                            <ComboBox
                              size="sm"
                              titleText=""
                              id={`item-${row.uuid}`}
                              initialSelectedItem={
                                row?.stockItemUuid
                                  ? ({
                                      uuid: row?.stockItemUuid,
                                      display: row?.stockItemName,
                                    } as any)
                                  : null
                              }
                              selectedItem={
                                row?.stockItemUuid
                                  ? {
                                      uuid: row?.stockItemUuid,
                                      display: row?.stockItemName,
                                    }
                                  : null
                              }
                              items={
                                row?.stockItemUuid
                                  ? [
                                      ...(stockItems?.some(
                                        (x) => x.uuid === row?.stockItemUuid
                                      )
                                        ? []
                                        : [
                                            {
                                              uuid: row?.stockItemUuid,
                                              display: row?.stockItemName,
                                            },
                                          ]),
                                      ...(stockItems ?? []),
                                    ]
                                  : stockItems
                              }
                              onChange={(data: { selectedItem: any }) =>
                                onStockItemChanged(row, data)
                              }
                              shouldFilterItem={(data) => true}
                              onInputChange={(q) =>
                                handleStockItemsSearch(row, q)
                              }
                              itemToString={(item) =>
                                item?.display ??
                                (item?.drugName
                                  ? `${item?.drugName}${
                                      item?.commonName ?? item?.conceptName
                                        ? ` (${
                                            item?.commonName ??
                                            item?.conceptName
                                          })`
                                        : ""
                                    }`
                                  : null) ??
                                item?.conceptName ??
                                ""
                              }
                              placeholder={"Type to search..."}
                              invalid={
                                row.uuid in errors &&
                                "stockItemUuid" in errors[row.uuid] &&
                                !errors[row.uuid]["stockItemUuid"]
                              }
                            />
                          )}
                          {(!canEdit || !row.uuid.startsWith("new-item")) && (
                            <Link
                              target={"_blank"}
                              to={URL_STOCK_ITEM(row?.stockItemUuid!)}
                            >{`${row?.stockItemName}`}</Link>
                          )}
                        </TableCell>
                        {showQuantityRequested && (
                          <TableCell>
                            {row?.quantityRequested?.toLocaleString() ?? ""}{" "}
                            {row?.quantityRequestedPackagingUOMName ?? ""}
                          </TableCell>
                        )}
                        {(requiresActualBatchInformation ||
                          requiresBatchUuid) && (
                          <TableCell>
                            {requiresActualBatchInformation &&
                              (canEdit ||
                                (canUpdateBatchInformation &&
                                  row?.permission
                                    ?.canUpdateBatchInformation)) && (
                                <TextInput
                                  size="sm"
                                  id={`batch-${row.uuid}`}
                                  maxLength={50}
                                  onChange={(e) => onBatchNoChange(row, e)}
                                  value={row?.batchNo ?? ""}
                                  labelText=""
                                  invalidText=""
                                  invalid={
                                    row.uuid in errors &&
                                    "batchNo" in errors[row.uuid] &&
                                    !errors[row.uuid]["batchNo"]
                                  }
                                />
                              )}
                            {requiresBatchUuid &&
                              !requiresActualBatchInformation &&
                              canEdit && (
                                <ComboBox
                                  titleText=""
                                  size="sm"
                                  id={`batchuuid-${row.uuid}`}
                                  initialSelectedItem={
                                    row?.stockBatchUuid
                                      ? ({
                                          uuid: row?.stockBatchUuid,
                                          batchNo: row?.batchNo ?? "",
                                          expiration: row?.expiration,
                                        } as any)
                                      : null
                                  }
                                  items={
                                    row?.stockBatchUuid
                                      ? [
                                          ...(row.stockItemUuid in
                                            itemBatchNos &&
                                          itemBatchNos[row.stockItemUuid] &&
                                          itemBatchNos[row.stockItemUuid].some(
                                            (x) => x.uuid === row.stockBatchUuid
                                          )
                                            ? []
                                            : [
                                                {
                                                  uuid: row?.stockBatchUuid,
                                                  display: row?.batchNo,
                                                },
                                              ]),
                                          ...((row.stockItemUuid &&
                                          row.stockItemUuid in itemBatchNos
                                            ? itemBatchNos[row.stockItemUuid]
                                            : null) ?? []),
                                        ]
                                      : (row.stockItemUuid &&
                                        row.stockItemUuid in itemBatchNos
                                          ? itemBatchNos[row.stockItemUuid]
                                          : null) ?? []
                                  }
                                  onChange={(data: { selectedItem: any }) =>
                                    onBatchUuidFieldChanged(row, data)
                                  }
                                  onFocus={(e) =>
                                    handleStockBatchSearch(row, "")
                                  }
                                  onToggleClick={(e) =>
                                    handleStockBatchSearch(row, "")
                                  }
                                  shouldFilterItem={(data) => true}
                                  onInputChange={(q) =>
                                    handleStockBatchSearch(row, q)
                                  }
                                  itemToString={(item) => item?.batchNo ?? ""}
                                  placeholder={"Filter..."}
                                  invalid={
                                    row.uuid in errors &&
                                    "stockBatchUuid" in errors[row.uuid] &&
                                    !errors[row.uuid]["stockBatchUuid"]
                                  }
                                />
                              )}
                            {!(
                              canUpdateBatchInformation &&
                              row?.permission?.canUpdateBatchInformation
                            ) &&
                              !canEdit &&
                              row?.batchNo}
                          </TableCell>
                        )}
                        {(requiresActualBatchInformation ||
                          requiresBatchUuid) && (
                          <TableCell>
                            {(canEdit ||
                              (canUpdateBatchInformation &&
                                row?.permission?.canUpdateBatchInformation)) &&
                              requiresActualBatchInformation && (
                                <DatePicker
                                  id={`expiration-${row.uuid}`}
                                  datePickerType="single"
                                  minDate={formatForDatePicker(minDate)}
                                  locale="en"
                                  dateFormat={DATE_PICKER_CONTROL_FORMAT}
                                  onChange={(e) =>
                                    onExpirationDateChange(row, e)
                                  }
                                >
                                  <DatePickerInput
                                    size="sm"
                                    autoComplete="off"
                                    id={`expiration-input-${row.uuid}`}
                                    name="operationDate"
                                    placeholder={DATE_PICKER_FORMAT}
                                    labelText=""
                                    defaultValue={formatForDatePicker(
                                      row?.expiration
                                    )}
                                    onChange={(e) =>
                                      onExpirationDateChangeInput(
                                        row,
                                        e.target.value
                                      )
                                    }
                                    invalid={
                                      row.uuid in errors &&
                                      "expiration" in errors[row.uuid] &&
                                      !errors[row.uuid]["expiration"]
                                    }
                                  />
                                </DatePicker>
                              )}
                            {((!(
                              canUpdateBatchInformation &&
                              row?.permission?.canUpdateBatchInformation
                            ) &&
                              !canEdit) ||
                              requiresBatchUuid) &&
                              formatForDatePicker(row?.expiration)}
                          </TableCell>
                        )}
                        <TableCell>
                          {canEdit && (
                            <NumberInput
                              className="small-placeholder-text"
                              size="sm"
                              id={`qty-${row.uuid}`}
                              allowEmpty={true}
                              onChange={(e: any, d: any) =>
                                onQuantityFieldChange(row, e?.target?.value)
                              }
                              value={row?.quantity ?? ""}
                              invalidText=""
                              placeholder={
                                requiresBatchUuid &&
                                !requiresActualBatchInformation &&
                                row?.stockBatchUuid in batchBalance
                                  ? `Bal: ${
                                      batchBalance[
                                        row?.stockBatchUuid
                                      ]?.quantity?.toLocaleString() ?? ""
                                    } ${
                                      batchBalance[row?.stockBatchUuid]
                                        ?.quantityUoM ?? ""
                                    }`
                                  : ""
                              }
                              invalid={
                                row.uuid in errors &&
                                "quantity" in errors[row.uuid] &&
                                !errors[row.uuid]["quantity"]
                              }
                            />
                          )}
                          {!canEdit && row?.quantity?.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {canEdit && (
                            <ComboBox
                              titleText=""
                              size="sm"
                              id={`quantityuom-${row.uuid}`}
                              initialSelectedItem={
                                row?.stockItemPackagingUOMUuid
                                  ? ({
                                      uuid: row?.stockItemPackagingUOMUuid,
                                      display: row?.stockItemPackagingUOMName,
                                    } as any)
                                  : null
                              }
                              //items={row?.stockItemPackagingUOMUuid ? [...((row.stockItemUuid in itemUoM && itemUoM[row.stockItemUuid] && itemUoM[row.stockItemUuid].some(x => x.uuid === row.stockItemPackagingUOMUuid)) ? [] : [{ uuid: row?.stockItemPackagingUOMUuid, display: row?.stockItemPackagingUOMName }]), ...(row.packagingUnits ?? (row.stockItemUuid && (row.stockItemUuid in itemUoM) ? itemUoM[row.stockItemUuid] : null) ?? [])] : (row.packagingUnits ?? (row.stockItemUuid && (row.stockItemUuid in itemUoM) ? itemUoM[row.stockItemUuid] : null) ?? [])}
                              items={
                                row?.packagingUnits
                                  ? row.packagingUnits
                                  : row?.stockItemPackagingUOMUuid
                                  ? [
                                      ...(row.stockItemUuid in itemUoM &&
                                      itemUoM[row.stockItemUuid] &&
                                      itemUoM[row.stockItemUuid].some(
                                        (x) =>
                                          x.uuid ===
                                          row.stockItemPackagingUOMUuid
                                      )
                                        ? []
                                        : [
                                            {
                                              uuid: row?.stockItemPackagingUOMUuid,
                                              display:
                                                row?.stockItemPackagingUOMName,
                                            },
                                          ]),
                                      ...(row.packagingUnits ??
                                        (row.stockItemUuid &&
                                        row.stockItemUuid in itemUoM
                                          ? itemUoM[row.stockItemUuid]
                                          : null) ??
                                        []),
                                    ]
                                  : row.packagingUnits ??
                                    (row.stockItemUuid &&
                                    row.stockItemUuid in itemUoM
                                      ? itemUoM[row.stockItemUuid]
                                      : null) ??
                                    []
                              }
                              onChange={(data: { selectedItem: any }) =>
                                onQuantityUomFieldChanged(row, data)
                              }
                              onFocus={(e) =>
                                handleStockItemPackagingUoMsSearch(row, "")
                              }
                              onToggleClick={(e) =>
                                handleStockItemPackagingUoMsSearch(row, "")
                              }
                              shouldFilterItem={(data) => true}
                              onInputChange={(q) =>
                                handleStockItemPackagingUoMsSearch(row, q)
                              }
                              itemToString={(item) =>
                                item?.display ?? item?.packagingUomName ?? ""
                              }
                              placeholder={"Filter..."}
                              invalid={
                                row.uuid in errors &&
                                "stockItemPackagingUOMUuid" in
                                  errors[row.uuid] &&
                                !errors[row.uuid]["stockItemPackagingUOMUuid"]
                              }
                            />
                          )}
                          {!canEdit && row?.stockItemPackagingUOMName}
                        </TableCell>
                        {canCapturePurchasePrice && (
                          <TableCell>
                            {canEdit && (
                              <NumberInput
                                size="sm"
                                invalid={
                                  row.uuid in errors &&
                                  "purchasePrice" in errors[row.uuid] &&
                                  !errors[row.uuid]["purchasePrice"]
                                }
                                invalidText=""
                                id={`purchaseprice-${row.uuid}`}
                                allowEmpty={true}
                                onChange={(e: any, d: any) =>
                                  onPurchasePriceFieldChange(
                                    row,
                                    e?.target?.value
                                  )
                                }
                                value={row?.purchasePrice ?? ""}
                                title=""
                              />
                            )}
                            {!canEdit && row?.purchasePrice?.toLocaleString()}
                          </TableCell>
                        )}
                        {canEdit && (
                          <TableCell>
                            <Button
                              type="button"
                              size="sm"
                              className="submitButton clear-padding-margin"
                              iconDescription={"Delete"}
                              kind="ghost"
                              renderIcon={16}
                              onClick={(e) => onRemoveItem(row, e)}
                            />
                          </TableCell>
                        )}
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
      {canEdit && !locked && (
        <div className="stkpg-form-buttons">
          <Button
            name="continue"
            type="submit"
            className="submitButton"
            onClick={onContinue}
            kind="primary"
            renderIcon={ArrowRight24}
          >
            {t("stockmanagement.next")}
          </Button>
          <Button
            name="save"
            type="submit"
            className="submitButton"
            onClick={handleSave}
            kind="secondary"
            renderIcon={Save24}
          >
            {t("stockmanagement.save")}
          </Button>
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
      {!canEdit &&
        canUpdateBatchInformation &&
        hasItemsWithUpdateableBatchInfo && (
          <div className="stkpg-form-buttons">
            <Button
              name="updateBatchInfo"
              type="submit"
              onClick={handleBatchInfoSave}
              kind="danger--primary"
              renderIcon={Save24}
            >
              {t("stockmanagement.stockoperation.updatebatchinfo")}
            </Button>
          </div>
        )}
    </>
  );
};

export default StockOperationItemsTable;
