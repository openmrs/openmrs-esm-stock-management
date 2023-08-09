import { Edit16, TrashCan16 } from "@carbon/icons-react";
import {
  Button,
  DataTable,
  DataTableSkeleton,
  Select,
  SelectItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableExpandHeader,
  TableExpandRow,
  TableExpandedRow,
  TableHead,
  TableHeader,
  TableRow,
  TableToolbar,
  TableToolbarAction,
  TableToolbarContent,
  TableToolbarMenu,
} from "@carbon/react";
import { produce } from "immer";
import { cloneDeep } from "lodash-es";
import React, {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Link } from "react-router-dom";
import styles from "../../root.module.scss";
import { ResourceRepresentation } from "../core/api/api";
import { useLazyGetRolesQuery } from "../core/api/lookups";
import { StockRuleFilter, useGetStockRulesQuery } from "../core/api/stockItem";
import { Party } from "../core/api/types/Party";
import { Role } from "../core/api/types/identity/Role";
import { StockItemPackagingUOMDTO } from "../core/api/types/stockItem/StockItemPackagingUOM";
import { StockRule } from "../core/api/types/stockItem/StockRule";
import { errorAlert } from "../core/utils/alert";
import { formatDisplayDateTime } from "../core/utils/datetimeUtils";
import { isDesktopLayout, useLayoutType } from "../core/utils/layoutUtils";
import { toErrorMessage } from "../core/utils/stringUtils";
import useTranslation from "../core/utils/translation";
import { EditStockRule } from "./edit-stock-rule.component";

export interface StockRuleTableProps {
  stockItemUuid: string;
  canEdit: boolean;
  actions: {
    onGoBack: () => void;
    onRemoveItem: (itemDto: StockRule) => void;
  };
  setSelectedTab: React.Dispatch<React.SetStateAction<number>>;
  errors: { [key: string]: { [key: string]: boolean } };
  setItemValidity: React.Dispatch<
    React.SetStateAction<{ [key: string]: { [key: string]: boolean } }>
  >;
  stockItemPackagingUnits: StockItemPackagingUOMDTO[];
  partyFilterList: Party[];
  partyLookupList: Party[];
  setShowSplash: React.Dispatch<React.SetStateAction<boolean>>;
}

const handleErrors = (payload: any) => {
  var errorMessage = toErrorMessage(payload);
  errorAlert(`${errorMessage}`);
  return;
};

const StockRulesTable: React.FC<StockRuleTableProps> = ({
  stockItemUuid,
  canEdit,
  actions,
  setSelectedTab,
  errors,
  setItemValidity,
  stockItemPackagingUnits,
  partyLookupList,
  setShowSplash,
  partyFilterList,
}) => {
  const { t } = useTranslation();
  const isDesktop = isDesktopLayout(useLayoutType());
  const [roles, setRoles] = useState<Role[]>([]);
  const [getRoles, { isFetching: isFetchingRoles }] = useLazyGetRolesQuery();
  const [stockRuleFilter, setStockRuleFilter] = useState<StockRuleFilter>({
    v: ResourceRepresentation.Full,
    q: null,
    stockItemUuid: stockItemUuid,
  });
  const {
    data: stockRules,
    isLoading: isLoadingStockRules,
    refetch: refetchStockRules,
  } = useGetStockRulesQuery(stockRuleFilter, {
    refetchOnMountOrArgChange: true,
  });
  const [editableModel, setEditableModel] = useState<StockRule>();
  const [showEditDialog, setShowEditDialog] = useState<boolean>(false);

  useEffect(() => {
    async function loadLookups() {
      if (canEdit) {
        if (!roles || roles.length === 0) {
          getRoles({ v: ResourceRepresentation.Default })
            .unwrap()
            .then((payload: any) => {
              if ((payload as any).error) {
                handleErrors(payload);
                return;
              } else {
                setRoles(payload?.results as Role[]);
              }
            })
            .catch((error) => handleErrors(error));
        }
      }
    }
    loadLookups();
  }, [canEdit, getRoles, roles]);

  const createStockRule = () => {
    let newStockRule: StockRule = {
      stockItemUuid: stockItemUuid,
      enabled: true,
      enableDescendants: false,
    } as any as StockRule;
    setEditableModel(newStockRule);
    setShowEditDialog(true);
  };

  const editStockRule = useCallback(
    (itemId: string) => {
      let item = stockRules?.results?.find((p) => p.uuid === itemId);
      if (item) {
        setEditableModel(cloneDeep(item));
        setShowEditDialog(true);
      }
    },
    [stockRules?.results]
  );

  const handlerNameClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>, uuid: string) => {
      event.preventDefault();
      editStockRule(uuid);
    },
    [editStockRule]
  );

  const onEditItem = useCallback(
    (itemId: string, event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      editStockRule(itemId);
    },
    [editStockRule]
  );

  const onRemoveItem = useCallback(
    (itemId: string, event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      let item = stockRules?.results?.find((p) => p.uuid === itemId);
      if (!item) {
        return;
      }
      actions.onRemoveItem(item);
    },
    [actions, stockRules]
  );

  const headers = [
    {
      key: "location",
      header: t("stockmanagement.stockitem.stockrule.location"),
    },
    { key: "name", header: t("stockmanagement.stockitem.stockrule.name") },
    {
      key: "quantity",
      header: t("stockmanagement.stockitem.stockrule.quantity"),
    },
    {
      key: "evaluationfrequency",
      header: t("stockmanagement.stockitem.stockrule.evaluationfrequency"),
    },
    {
      key: "actionfrequency",
      header: t("stockmanagement.stockitem.stockrule.actionfrequency"),
    },
    {
      key: "alertrole",
      header: t("stockmanagement.stockitem.stockrule.alertrole"),
    },
    {
      key: "mailrole",
      header: t("stockmanagement.stockitem.stockrule.mailrole"),
    },
    { key: "enabled", header: t("stockmanagement.stockitem.stockrule.enable") },
    { key: "actions", header: "" },
    { key: "details", header: "" },
  ];

  const rows: Array<any> = useMemo(
    () =>
      stockRules?.results
        ? cloneDeep(stockRules.results)
            .sort((x, y) => x.locationName.localeCompare(y.locationName))
            ?.map((stockRule, index) => ({
              id: stockRule?.uuid,
              key: `key-${stockRule?.uuid}`,
              uuid: `${stockRule?.uuid}`,
              location: `${stockRule?.locationName}${
                stockRule.enableDescendants ? " and below" : " only"
              }`,
              name:
                canEdit && stockRule.permission?.canEdit ? (
                  <Link
                    to={"self"}
                    onClick={(e) => handlerNameClick(e, stockRule?.uuid)}
                  >
                    {stockRule.name}
                  </Link>
                ) : (
                  stockRule.name
                ),
              quantity: `${stockRule?.quantity?.toLocaleString() ?? ""} ${
                stockRule?.packagingUomName ?? ""
              }`,
              evaluationfrequency: `${
                stockRule?.evaluationFrequency?.toLocaleString() ?? ""
              } minutes`,
              actionfrequency: `${
                stockRule?.actionFrequency?.toLocaleString() ?? ""
              }  minutes`,
              alertrole: stockRule?.alertRole ?? "",
              mailrole: stockRule?.mailRole ?? "",
              actions:
                canEdit && stockRule.permission?.canEdit ? (
                  <div
                    key={`${stockRule?.uuid}-actions`}
                    style={{ display: "inline-block", whiteSpace: "nowrap" }}
                  >
                    <Button
                      key={`${stockRule?.uuid}-actions-edit`}
                      type="button"
                      size="sm"
                      className="submitButton clear-padding-margin"
                      iconDescription={"Edit"}
                      kind="ghost"
                      renderIcon={Edit16}
                      onClick={(e) => onEditItem(stockRule.uuid, e)}
                    />
                    <Button
                      key={`${stockRule?.uuid}-actions-delete`}
                      type="button"
                      size="sm"
                      className="submitButton clear-padding-margin"
                      iconDescription={"Delete"}
                      kind="ghost"
                      renderIcon={TrashCan16}
                      onClick={(e) => onRemoveItem(stockRule.uuid, e)}
                    />
                  </div>
                ) : (
                  ""
                ),
              enabled: stockRule?.enabled ? "Yes" : "No",
              details: (
                <div className="tbl-expand-display-fields tbl-expand-display-fields-pad">
                  <div className="field-label">
                    <span className="field-title">
                      {t("stockmanagement.created")}
                    </span>
                    <span className="field-desc">
                      <span className="action-date">
                        {formatDisplayDateTime(stockRule?.dateCreated)}
                      </span>{" "}
                      {t("stockmanagement.by")}{" "}
                      <span className="action-by">
                        {stockRule.creatorFamilyName ?? ""}{" "}
                        {stockRule.creatorGivenName ?? ""}
                      </span>
                    </span>
                  </div>
                  {stockRule?.lastEvaluation && (
                    <div className="field-label">
                      <span className="field-title">
                        {t(
                          "stockmanagement.stockitem.stockrule.lastevaluation"
                        )}
                      </span>
                      <span className="field-desc">
                        <span className="action-date">
                          {formatDisplayDateTime(stockRule?.lastEvaluation)}
                        </span>
                      </span>
                    </div>
                  )}
                  {stockRule?.nextEvaluation && (
                    <div className="field-label">
                      <span className="field-title">
                        {t(
                          "stockmanagement.stockitem.stockrule.nextevaluation"
                        )}
                      </span>
                      <span className="field-desc">
                        <span className="action-date">
                          {formatDisplayDateTime(stockRule?.nextEvaluation)}
                        </span>
                      </span>
                    </div>
                  )}
                  {stockRule?.lastActionDate && (
                    <div className="field-label">
                      <span className="field-title">
                        {t(
                          "stockmanagement.stockitem.stockrule.lastactiondate"
                        )}
                      </span>
                      <span className="field-desc">
                        <span className="action-date">
                          {formatDisplayDateTime(stockRule?.lastActionDate)}
                        </span>
                      </span>
                    </div>
                  )}
                  {stockRule?.nextActionDate && (
                    <div className="field-label">
                      <span className="field-title">
                        {t(
                          "stockmanagement.stockitem.stockrule.nextactiondate"
                        )}
                      </span>
                      <span className="field-desc">
                        <span className="action-date">
                          {formatDisplayDateTime(stockRule?.nextActionDate)}
                        </span>
                      </span>
                    </div>
                  )}
                </div>
              ),
            }))
        : [],
    [
      canEdit,
      handlerNameClick,
      onEditItem,
      onRemoveItem,
      stockRules?.results,
      t,
    ]
  );

  const handleRefresh = () => {
    refetchStockRules();
  };

  const onCloseEditDialog = () => {
    setShowEditDialog(false);
    setEditableModel(undefined);
  };

  const handleSave = async () => {
    try {
      //actions.onSaveStockRule(null);
    } finally {
    }
  };

  const onLocationFilterChange = (evt: ChangeEvent<HTMLSelectElement>) => {
    let newValue = evt.target.value;
    setStockRuleFilter(
      produce((draft) => {
        draft.locationUuid = newValue;
      })
    );
  };

  if (
    canEdit &&
    (isFetchingRoles ||
      isLoadingStockRules ||
      !partyLookupList ||
      stockItemPackagingUnits.length === 0)
  ) {
    return (
      <DataTableSkeleton
        className={styles.dataTableSkeleton}
        showHeader={false}
        rowCount={5}
        columnCount={5}
        zebra
      />
    );
  }

  return (
    <>
      <div className={`${styles.tableOverride} stkpg-operation-items`}>
        <DataTable
          rows={rows as any}
          headers={headers}
          isSortable={true}
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
              <TableToolbar>
                <TableToolbarContent className="stkpg-filters-nosearch">
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      paddingLeft: "0.5rem",
                    }}
                  >
                    <span>
                      Stock rules that trigger notifications when stock
                      quantites reach the set threshold
                    </span>
                  </div>
                  <div>
                    <Select
                      id="locationFilter"
                      name="locationFilter"
                      className="select-field"
                      labelText=""
                      onChange={onLocationFilterChange}
                    >
                      <SelectItem
                        value=""
                        text={t("stockmanagement.stockitem.alllocations")}
                      />
                      {partyFilterList?.map((party) => {
                        return (
                          <SelectItem
                            key={party.locationUuid}
                            value={party.locationUuid}
                            text={party.name}
                          />
                        );
                      })}
                    </Select>
                    <TableToolbarMenu>
                      <TableToolbarAction onClick={() => refetchStockRules()}>
                        Refresh
                      </TableToolbarAction>
                    </TableToolbarMenu>
                    {canEdit && (
                      <>
                        <Button
                          onClick={createStockRule}
                          size="sm"
                          kind="primary"
                        >
                          {t("stockmanagement.addnew")}
                        </Button>
                      </>
                    )}
                  </div>
                </TableToolbarContent>
              </TableToolbar>
              <Table {...getTableProps()}>
                <TableHead>
                  <TableRow>
                    <TableExpandHeader />
                    {headers.map(
                      (header: any, index) =>
                        header.key !== "details" && (
                          <TableHeader
                            {...getHeaderProps({
                              header,
                              isSortable: header.isSortable,
                            })}
                            className={
                              isDesktop
                                ? styles.desktopHeader
                                : styles.tabletHeader
                            }
                            style={header?.styles}
                            key={`${header.key}`}
                          >
                            {header.header?.content ?? header.header}
                          </TableHeader>
                        )
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row: any, rowIndex) => {
                    return (
                      <React.Fragment key={row.id}>
                        <TableExpandRow
                          className={
                            isDesktop ? styles.desktopRow : styles.tabletRow
                          }
                          {...getRowProps({ row })}
                        >
                          {row.cells.map(
                            (cell: any, index: any) =>
                              cell?.info?.header !== "details" && (
                                <TableCell key={cell.id}>
                                  {cell.value}
                                </TableCell>
                              )
                          )}
                        </TableExpandRow>
                        <TableExpandedRow colSpan={headers.length}>
                          <div>{row.cells[row.cells.length - 1].value}</div>
                        </TableExpandedRow>
                      </React.Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        ></DataTable>
        <div className="table-bottom-border"></div>
      </div>
      {showEditDialog && editableModel && (
        <EditStockRule
          model={editableModel}
          isNew={!editableModel?.uuid}
          refreshRules={handleRefresh}
          onCloseEditDialog={onCloseEditDialog}
          setModel={setEditableModel as Dispatch<SetStateAction<StockRule>>}
          setShowSplash={setShowSplash}
          setSelectedTab={setSelectedTab}
          canEdit={
            canEdit &&
            ((editableModel?.uuid && editableModel.permission?.canEdit!) ||
              !editableModel?.uuid)
          }
          packagingUnits={stockItemPackagingUnits}
          partyLookupList={partyLookupList}
          roles={roles}
          actions={{
            onGoBack: actions.onGoBack,
            onSave: handleSave,
          }}
        />
      )}
    </>
  );
};

export default StockRulesTable;
