import {
  CheckmarkOutline32,
  Copy16,
  Download16,
  Error16,
  IncompleteCancel32,
  MisuseOutline32,
  View16,
  WarningAltFilled32,
} from "@carbon/icons-react";
import {
  Button,
  DataTable,
  DataTableSkeleton,
  DatePicker,
  DatePickerInput,
  DenormalizedRow,
  Modal,
  Pagination,
  SearchProps,
  Select,
  SelectItem,
  Table,
  TableBatchAction,
  TableBatchActions,
  TableBody,
  TableCell,
  TableContainer,
  TableExpandHeader,
  TableExpandRow,
  TableExpandedRow,
  TableHead,
  TableHeader,
  TableRow,
  TableSelectRow,
  TableToolbar,
  TableToolbarAction,
  TableToolbarContent,
  TableToolbarMenu,
} from "carbon-components-react";
import React, {
  CSSProperties,
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import styles from "../../root.module.scss";
import { Ripple } from "../components/spinner/Ripple";
import { Splash } from "../components/spinner/Splash";
import { URL_BATCH_JOB_ARTIFACT } from "../constants";
import { useCancelBatchJobsMutation } from "../core/api/batchJob";
import {
  BatchJob,
  BatchJobStatusCancelled,
  BatchJobStatusCompleted,
  BatchJobStatusExpired,
  BatchJobStatusFailed,
  BatchJobStatusPending,
  BatchJobStatusRunning,
  BatchJobStatuses,
  isBatchJobStillActive,
  parseParametersToMap,
} from "../core/api/types/BatchJob";
import { PageableResult } from "../core/api/types/PageableResult";
import { Party } from "../core/api/types/Party";
import { TASK_STOCKMANAGEMENT_REPORTS_MUTATE } from "../core/privileges";
import { errorAlert, successAlert } from "../core/utils/alert";
import {
  DATE_PICKER_CONTROL_FORMAT,
  DATE_PICKER_FORMAT,
  formatDisplayDateTime,
} from "../core/utils/datetimeUtils";
import { ClickElement } from "../core/utils/elementUtil";
import { isDesktopLayout, useLayoutType } from "../core/utils/layoutUtils";
import { toErrorMessage } from "../core/utils/stringUtils";
import useTranslation from "../core/utils/translation";
import { useHasPreviledge } from "../stock-auth/AccessControl";
import { EditReport, ReportModel } from "./stock-edit-report.component";
import { ReportParameter, ReportType } from "./stock-report-type";

interface ReportTableProps {
  batchJobs: PageableResult<BatchJob>;
  reportTypes: PageableResult<ReportType> | undefined;
  partyLookupList: Party[];
  stockSourceList: Party[];
  gridPartyLookupList: Party[];
  style?: CSSProperties;
  autoFocus?: boolean;
  isLoading: boolean;
  isFetching?: boolean;
  search: {
    onSearch(searchTerm: string): any;
    refetch(): void;
    currentSearchTerm?: string | null;
    otherSearchProps?: SearchProps;
    onLocationScopeChange: (locationScope: string) => void;
    onStatusChange: (status: string) => void;
    onDateCreatedChange: (
      dateCreatedMin: string | undefined,
      dateCreatedMax: string | undefined
    ) => void;
    onCompletedDateChange: (
      completedDateMin: string | undefined,
      completedDateMax: string | undefined
    ) => void;
  };
  pagination: {
    usePagination: boolean;
    currentPage: number;
    onChange(props: any): any;
    pageSize: number;
    totalItems: number;
    pagesUnknown?: boolean;
    lastPage?: boolean;
  };
}

const ReportTable: React.FC<ReportTableProps> = ({
  batchJobs,
  reportTypes,
  partyLookupList,
  stockSourceList,
  gridPartyLookupList,
  search,
  isLoading,
  autoFocus,
  isFetching,
  pagination,
}) => {
  const { t } = useTranslation();
  const isDesktop = isDesktopLayout(useLayoutType());
  const [openCancelConfirm, setOpenCancelConfirm] = useState(false);
  const [selectedCancel, setSelectedCancel] = useState<string[] | null>(null);
  const [
    cancelReport,
    { reset: resetCancelReportHook, isLoading: startedCancellingBatchJob },
  ] = useCancelBatchJobsMutation();
  const [canCreateReports] = useHasPreviledge(
    [TASK_STOCKMANAGEMENT_REPORTS_MUTATE],
    false
  );
  const componentMounted = useRef(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editableBatchJob, setEditableBatchJob] = useState<ReportModel>();
  const [showSplash, setShowSplash] = useState<boolean>(false);
  const [refreshTimeoutId, setRefreshTimeoutId] = useState<number>();

  React.useEffect(() => {
    componentMounted.current = true;
    scheduleCheckPendingBatchJobs();
    return () => {
      componentMounted.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const headers = [
    {
      key: "checkbox",
      header: t("stockmanagement.report.list.header.checkbox"),
    },
    {
      key: "description",
      header: t("stockmanagement.report.list.header.description"),
    },
    {
      key: "parameters",
      header: t("stockmanagement.report.list.header.parameters"),
    },
    {
      key: "requesteddate",
      header: t("stockmanagement.report.list.header.requesteddate"),
    },
    {
      key: "owners",
      header: t("stockmanagement.report.list.header.owners"),
    },
    {
      key: "status",
      header: t("stockmanagement.report.list.header.status"),
    },
    {
      key: "actions",
      header: "",
    },
    {
      key: "details",
      header: t("stockmanagement.report.list.header.details"),
    },
  ];

  const onDownloadReportClick = useCallback(
    (uuid: string, fileExit: string | undefined | null) => {
      if (uuid) {
        let record = batchJobs?.results?.find((p) => p.uuid === uuid);
        if (record) {
          window.open(URL_BATCH_JOB_ARTIFACT(record.uuid, true), "_blank");
        }
      }
    },
    [batchJobs?.results]
  );

  const cancelReportOnCancel = () => {
    setSelectedCancel(null);
    setOpenCancelConfirm(false);
  };

  const cancelReportOnContinue = () => {
    if (selectedCancel == null) {
      cancelReportOnCancel();
      return;
    }
    setOpenCancelConfirm(false);
    resetCancelReportHook();
    cancelReport(selectedCancel)
      .then((payload: any) => {
        if ((payload as any).error) {
          var errorMessage = toErrorMessage(payload);
          errorAlert(
            `${t("stockmanagement.report.cancelled.failed")} ${errorMessage}`
          );
          return;
        }
        ClickElement("button.bx--batch-summary__cancel");
        setSelectedCancel(null);
        search.refetch();
        successAlert(t("stockmanagement.report.cancelled.success"));
      })
      .catch((error) => {
        var errorMessage = toErrorMessage(error);
        errorAlert(
          `${t("stockmanagement.report.cancelled.failed")} ${errorMessage}`
        );
        return;
      });
  };

  const onCloneReportClick = useCallback(
    (uuid: string) => {
      let batchJob = batchJobs?.results?.find((p) => p.uuid === uuid);
      if (batchJob && batchJob.parameters) {
        let parameters = parseParametersToMap(batchJob.parameters);
        if (parameters) {
          let newReport: ReportModel = { childLocations: false };
          if (parameters["report"] && parameters["report"]["value"]) {
            let reportType = parameters["report"]["value"];
            let reportTypeObj = reportTypes?.results?.find(
              (p) => p.systemName === reportType
            );
            if (reportTypeObj) {
              newReport.reportName = reportTypeObj.name;
              newReport.reportSystemName = reportTypeObj.systemName;
            }
          }

          if (!newReport.reportSystemName) {
            return;
          }

          if (
            parameters[ReportParameter.ChildLocations] &&
            parameters[ReportParameter.ChildLocations]["value"]
          ) {
            newReport.childLocations =
              parameters[ReportParameter.ChildLocations]["value"] === "true";
          }

          if (
            parameters[ReportParameter.Date] &&
            parameters[ReportParameter.Date]["value"]
          ) {
            newReport.date = new Date(
              parameters[ReportParameter.Date]["value"]
            );
          }

          if (
            parameters[ReportParameter.StartDate] &&
            parameters[ReportParameter.StartDate]["value"]
          ) {
            newReport.startDate = new Date(
              parameters[ReportParameter.StartDate]["value"]
            );
          }

          if (
            parameters[ReportParameter.EndDate] &&
            parameters[ReportParameter.EndDate]["value"]
          ) {
            newReport.endDate = new Date(
              parameters[ReportParameter.EndDate]["value"]
            );
          }

          if (
            parameters[ReportParameter.InventoryGroupBy] &&
            parameters[ReportParameter.InventoryGroupBy]["value"]
          ) {
            newReport.inventoryGroupBy =
              parameters[ReportParameter.InventoryGroupBy]["value"];
            newReport.inventoryGroupByName =
              parameters[ReportParameter.InventoryGroupBy]["display"];
          }

          if (
            parameters[ReportParameter.Location] &&
            parameters[ReportParameter.Location]["value"]
          ) {
            let locationUuid = parameters[ReportParameter.Location]["value"];
            let party = partyLookupList?.find(
              (p) => p.locationUuid === locationUuid
            );
            if (party) {
              newReport.locationUuid =
                parameters[ReportParameter.Location]["value"];
              newReport.location =
                parameters[ReportParameter.Location]["display"];
            }
          }

          if (
            parameters[ReportParameter.MaxReorderLevelRatio] &&
            parameters[ReportParameter.MaxReorderLevelRatio]["value"]
          ) {
            newReport.maxReorderLevelRatio = parseFloat(
              parameters[ReportParameter.MaxReorderLevelRatio]["value"]
            );
          }

          if (
            parameters[ReportParameter.StockItemCategory] &&
            parameters[ReportParameter.StockItemCategory]["value"]
          ) {
            newReport.stockItemCategoryConceptUuid =
              parameters[ReportParameter.StockItemCategory]["value"];
            newReport.stockItemCategory =
              parameters[ReportParameter.StockItemCategory]["display"];
          }

          if (
            parameters[ReportParameter.StockSource] &&
            parameters[ReportParameter.StockSource]["value"]
          ) {
            newReport.stockSourceUuid =
              parameters[ReportParameter.StockSource]["value"];
            newReport.stockSource =
              parameters[ReportParameter.StockSource]["display"];
          }

          if (
            parameters[ReportParameter.StockSourceDestination] &&
            parameters[ReportParameter.StockSourceDestination]["value"]
          ) {
            newReport.stockSourceDestinationUuid =
              parameters[ReportParameter.StockSourceDestination]["value"];
            newReport.stockSourceDestination =
              parameters[ReportParameter.StockSourceDestination]["display"];
          }

          if (
            parameters[ReportParameter.StockItem] &&
            parameters[ReportParameter.StockItem]["value"]
          ) {
            newReport.stockItemUuid =
              parameters[ReportParameter.StockItem]["value"];
            newReport.stockItemName =
              parameters[ReportParameter.StockItem]["display"];
          }

          if (
            parameters[ReportParameter.MostLeastMoving] &&
            parameters[ReportParameter.MostLeastMoving]["value"]
          ) {
            newReport.mostLeastMoving =
              parameters[ReportParameter.MostLeastMoving]["value"];
            newReport.mostLeastMovingName =
              parameters[ReportParameter.MostLeastMoving]["display"];
          }

          if (
            parameters[ReportParameter.Fullfillment] &&
            parameters[ReportParameter.Fullfillment]["value"]
          ) {
            newReport.fullFillment =
              parameters[ReportParameter.Fullfillment]["value"]?.split(",");
          }

          if (
            parameters[ReportParameter.Limit] &&
            parameters[ReportParameter.Limit]["value"]
          ) {
            newReport.limit = parseFloat(
              parameters[ReportParameter.Limit]["value"]
            );
          }

          setEditableBatchJob(newReport);
          setShowEditDialog(true);
        }
      }
    },
    [batchJobs?.results, partyLookupList, reportTypes?.results]
  );

  const createBatchJob = () => {
    let newReport: ReportModel = { childLocations: false };
    setEditableBatchJob(newReport);
    setShowEditDialog(true);
  };

  const onViewItem = useCallback(
    async (uuid: string, event: React.MouseEvent<HTMLButtonElement>) => {
      if (event) {
        event.preventDefault();
      }
    },
    []
  );

  const displayParameterMap = (
    batchJobUuid: string,
    parameterMap: { [key: string]: { [key: string]: string } } | null
  ): React.ReactNode => {
    if (!parameterMap) {
      return null;
    }
    let objectKeys: string[] = Object.keys(parameterMap);
    if (objectKeys.length === 0) {
      return null;
    }
    return objectKeys.map((key, index) => {
      let displayField: string = parameterMap[key]["description"] ?? key;
      let displayValue: string =
        parameterMap[key]["display"] ?? parameterMap[key]["value"];
      return (
        <div key={`${batchJobUuid}-param-${index}`}>
          {displayField}: {displayValue}
        </div>
      );
    });
  };

  const scheduleCheckPendingBatchJobs = useCallback(() => {
    if (!componentMounted.current) return;
    if (refreshTimeoutId) {
      try {
        window.clearTimeout(refreshTimeoutId);
      } catch (e) {}
    }
    if (batchJobs?.results?.length > 0) {
      setRefreshTimeoutId(
        window.setTimeout(() => {
          if (!componentMounted?.current) return;
          let hasPendingBatchJob = batchJobs?.results?.some((p) =>
            isBatchJobStillActive(p.status)
          );
          if (hasPendingBatchJob) {
            search.refetch();
            scheduleCheckPendingBatchJobs();
          }
        }, 5000)
      );
    }
  }, [batchJobs, refreshTimeoutId, search]);

  useEffect(() => {
    scheduleCheckPendingBatchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batchJobs]);

  const rows: Array<any> = useMemo(
    () =>
      batchJobs?.results?.map((batchJob, index) => {
        let isBatchJobActive = isBatchJobStillActive(batchJob?.status);
        let completedExecution = batchJob?.status === BatchJobStatusCompleted;
        let parameterMap: React.ReactNode;
        let executionStateMap: React.ReactNode;
        try {
          parameterMap = displayParameterMap(
            batchJob.uuid,
            parseParametersToMap(batchJob?.parameters, ["param.report"])
          );
        } catch (ex) {
          console.log(ex);
        }
        try {
          executionStateMap = displayParameterMap(
            batchJob.uuid,
            parseParametersToMap(batchJob?.executionState)
          );
        } catch (ex) {
          console.log(ex);
        }
        return {
          checkbox: isBatchJobActive,
          id: batchJob?.uuid,
          key: `key-${batchJob?.uuid}`,
          uuid: `${batchJob?.uuid}`,
          batchJobType: batchJob.batchJobType,
          description: completedExecution ? (
            <a
              rel="noreferrer"
              href={URL_BATCH_JOB_ARTIFACT(batchJob.uuid, true)}
              target={"_blank"}
            >
              {batchJob.description}
            </a>
          ) : (
            `${batchJob.description} (${batchJob.status})`
          ),
          requesteddate: formatDisplayDateTime(batchJob.dateCreated),
          parameters: parameterMap,
          owners: batchJob?.owners?.map((p, index) => (
            <div
              key={`${batchJob.uuid}-owner-${index}`}
            >{`${p.ownerFamilyName} ${p.ownerGivenName}`}</div>
          )),
          status: (
            <>
              {batchJob.status === BatchJobStatusPending && (
                <Ripple title={batchJob.status} />
              )}
              {batchJob.status === BatchJobStatusRunning && (
                <Ripple className="report-running" title={batchJob.status} />
              )}
              {batchJob.status === BatchJobStatusFailed && (
                <WarningAltFilled32
                  className="report-failed"
                  title={batchJob.status}
                />
              )}
              {batchJob.status === BatchJobStatusCancelled && (
                <MisuseOutline32
                  className="report-cancelled"
                  title={batchJob.status}
                />
              )}
              {batchJob.status === BatchJobStatusCompleted && (
                <CheckmarkOutline32
                  className="report-completed"
                  title={batchJob.status}
                />
              )}
              {batchJob.status === BatchJobStatusExpired && (
                <IncompleteCancel32
                  className="report-expired"
                  title={batchJob.status}
                />
              )}
            </>
          ),
          details: (
            <>
              <div className="tbl-expand-display-fields">
                {batchJob?.status === BatchJobStatusCancelled && (
                  <div className="field-label">
                    <span className="field-title">
                      {t("stockmanagement.cancelled")}
                    </span>
                    <span className="field-desc">
                      <span className="action-date">
                        {formatDisplayDateTime(batchJob?.cancelledDate)}
                      </span>{" "}
                      {t("stockmanagement.by")}{" "}
                      <span className="action-by">
                        {batchJob.cancelledByFamilyName ?? ""}{" "}
                        {batchJob.cancelledByGivenName ?? ""}
                      </span>
                      <p>{batchJob.cancelReason}</p>
                    </span>
                  </div>
                )}
                {batchJob?.startTime && (
                  <div className="field-label">
                    <span className="field-title">
                      {t("stockmanagement.report.started")}
                    </span>
                    <span className="field-desc">
                      <span className="action-date">
                        {formatDisplayDateTime(batchJob?.startTime)}
                      </span>
                    </span>
                  </div>
                )}
                {batchJob?.endTime && (
                  <div className="field-label">
                    <span className="field-title">
                      {t("stockmanagement.report.ended")}
                    </span>
                    <span className="field-desc">
                      <span className="action-date">
                        {formatDisplayDateTime(batchJob?.endTime)}
                      </span>
                    </span>
                  </div>
                )}
                {batchJob?.expiration && (
                  <div className="field-label">
                    <span className="field-title">
                      {t("stockmanagement.report.expires")}
                    </span>
                    <span className="field-desc">
                      <span className="action-date">
                        {formatDisplayDateTime(batchJob?.expiration)}
                      </span>
                    </span>
                  </div>
                )}
                {executionStateMap && (
                  <div className="field-label">
                    <span className="field-title">
                      {t("stockmanagement.report.executionstate")}
                    </span>
                    <span className="field-desc">{executionStateMap}</span>
                  </div>
                )}
                {batchJob?.completedDate && (
                  <div className="field-label">
                    <span className="field-title">
                      {t("stockmanagement.report.completed")}
                    </span>
                    <span className="field-desc">
                      <span className="action-date">
                        {formatDisplayDateTime(batchJob?.completedDate)}
                      </span>
                    </span>
                  </div>
                )}
                {batchJob?.exitMessage && (
                  <div className="field-label">
                    <span className="field-title">
                      {t("stockmanagement.report.exitmessage")}
                    </span>
                    <span className="field-desc">
                      <p>{batchJob.exitMessage}</p>
                    </span>
                  </div>
                )}
              </div>
            </>
          ),
          actions: (
            <div
              key={`${batchJob?.uuid}-actions`}
              style={{ display: "inline-block", whiteSpace: "nowrap" }}
            >
              {batchJob.outputArtifactViewable &&
                batchJob.batchJobType === "hide" && (
                  <Button
                    key={`${batchJob?.uuid}-actions-view`}
                    type="button"
                    size="sm"
                    className="submitButton clear-padding-margin"
                    iconDescription={"Edit"}
                    kind="ghost"
                    renderIcon={View16}
                    onClick={(e) => onViewItem(batchJob.uuid, e)}
                  />
                )}
              <Button
                type="button"
                size="sm"
                className="submitButton clear-padding-margin"
                iconDescription={"Copy"}
                kind="ghost"
                renderIcon={Copy16}
                onClick={() => onCloneReportClick(batchJob.uuid)}
              />
              {completedExecution && (batchJob.outputArtifactSize ?? 0) > 0 && (
                <Button
                  type="button"
                  size="sm"
                  className="submitButton clear-padding-margin"
                  iconDescription={"Download"}
                  kind="ghost"
                  renderIcon={Download16}
                  onClick={() =>
                    onDownloadReportClick(
                      batchJob.uuid,
                      batchJob.outputArtifactFileExt
                    )
                  }
                />
              )}
            </div>
          ),
        };
      }),
    [
      batchJobs?.results,
      t,
      onViewItem,
      onCloneReportClick,
      onDownloadReportClick,
    ]
  );

  function cancelSelectedRows(
    event: React.MouseEvent<HTMLButtonElement>,
    selectedRows: readonly DenormalizedRow[]
  ) {
    if (selectedRows?.length > 0) {
      setSelectedCancel(selectedRows.map((p) => p.id));
      setOpenCancelConfirm(true);
    }
  }

  const handleRefresh = () => {
    search.refetch();
  };
  const onCloseEditDialog = (
    showReportStatus: boolean,
    batchJobUuid?: string | null
  ) => {
    setShowEditDialog(false);
    setEditableBatchJob(undefined);
    if (showReportStatus) {
    }
  };
  const onStatusChange = (evt: ChangeEvent<HTMLSelectElement>) => {
    search.onStatusChange(evt.target.value);
  };

  const onLocationScopeChange = (evt: ChangeEvent<HTMLSelectElement>) => {
    search.onLocationScopeChange(evt.target.value);
  };

  const onDateCreatedChange = (dates: Date[]): void => {
    search.onDateCreatedChange(
      dates[0] ? JSON.stringify(dates[0]).replaceAll('"', "") : undefined,
      dates[1] ? JSON.stringify(dates[1]).replaceAll('"', "") : undefined
    );
  };

  const onDateCompletedChange = (dates: Date[]): void => {
    search.onCompletedDateChange(
      dates[0] ? JSON.stringify(dates[0]).replaceAll('"', "") : undefined,
      dates[1] ? JSON.stringify(dates[1]).replaceAll('"', "") : undefined
    );
  };

  if (isLoading) {
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
      {showEditDialog && editableBatchJob && reportTypes?.results && (
        <EditReport
          model={editableBatchJob}
          isNew={true}
          refreshBatchJobs={handleRefresh}
          onCloseEditDialog={onCloseEditDialog}
          setModel={
            setEditableBatchJob as Dispatch<SetStateAction<ReportModel>>
          }
          setShowSplash={setShowSplash}
          reportTypes={reportTypes?.results ?? []}
          stockSourceList={stockSourceList}
          partyLookupList={partyLookupList}
        />
      )}
      {openCancelConfirm && (
        <Modal
          primaryButtonText={t("stockmanagement.yes")}
          secondaryButtonText={t("stockmanagement.no")}
          modalHeading={t("stockmanagement.confirm")}
          danger={true}
          onRequestClose={cancelReportOnCancel}
          shouldSubmitOnEnter={false}
          onRequestSubmit={cancelReportOnContinue}
          onSecondarySubmit={cancelReportOnCancel}
          open={true}
          size="sm"
        >
          <p>{t("stockmanagement.report.cancelled.confirmText")}</p>
        </Modal>
      )}
      {(startedCancellingBatchJob || showSplash) && <Splash active blockUi />}
      <div className={styles.tableOverride}>
        <DataTable
          rows={rows}
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
                <TableBatchActions {...getBatchActionProps()}>
                  {canCreateReports && (
                    <TableBatchAction
                      renderIcon={Error16}
                      iconDescription={t(
                        "stockmanagement.report.list.cancelselectedrows"
                      )}
                      onClick={(e) => cancelSelectedRows(e, selectedRows)}
                    >
                      {t("stockmanagement.report.cancelreport")}
                    </TableBatchAction>
                  )}
                </TableBatchActions>
                <TableToolbarContent>
                  <Select
                    className="stkpg-datable-select"
                    inline
                    id="statusFilter"
                    labelText=""
                    onChange={onStatusChange}
                  >
                    <SelectItem text="All" value={""} />
                    {BatchJobStatuses?.map((p) => {
                      return <SelectItem key={p} value={p} text={p} />;
                    })}
                  </Select>
                  <Select
                    className="stkpg-datable-select"
                    inline
                    id="locationScopeId"
                    labelText=""
                    onChange={onLocationScopeChange}
                  >
                    <SelectItem text="All" value={""} />
                    {gridPartyLookupList?.map((p) => {
                      return (
                        <SelectItem
                          key={p.locationUuid}
                          value={p.locationUuid}
                          text={p.name}
                        />
                      );
                    })}
                  </Select>
                  <div style={{ marginTop: "0.8rem" }}>
                    {t("stockmanagement.report.filter.requesteddate")}:
                  </div>
                  <DatePicker
                    datePickerType="range"
                    className="date-range-filter"
                    locale="en"
                    dateFormat={DATE_PICKER_CONTROL_FORMAT}
                    onChange={onDateCreatedChange}
                  >
                    <DatePickerInput
                      id="date-picker-input-id-start"
                      autoComplete="off"
                      placeholder={DATE_PICKER_FORMAT}
                      labelText=""
                    />
                    <DatePickerInput
                      id="date-picker-input-id-finish"
                      autoComplete="off"
                      placeholder={DATE_PICKER_FORMAT}
                      labelText=""
                    />
                  </DatePicker>
                  <div style={{ marginTop: "0.8rem" }}>
                    {t("stockmanagement.report.filter.completeddate")}:
                  </div>
                  <DatePicker
                    datePickerType="range"
                    className="date-range-filter"
                    locale="en"
                    dateFormat={DATE_PICKER_CONTROL_FORMAT}
                    onChange={onDateCompletedChange}
                  >
                    <DatePickerInput
                      id="date-picker-input-id-start"
                      autoComplete="off"
                      placeholder={DATE_PICKER_FORMAT}
                      labelText=""
                    />
                    <DatePickerInput
                      id="date-picker-input-id-finish"
                      autoComplete="off"
                      placeholder={DATE_PICKER_FORMAT}
                      labelText=""
                    />
                  </DatePicker>
                  <TableToolbarMenu>
                    <TableToolbarAction onClick={() => search.refetch()}>
                      Refresh
                    </TableToolbarAction>
                  </TableToolbarMenu>
                  {canCreateReports && (
                    <Button onClick={createBatchJob} size="sm" kind="primary">
                      {t("stockmanagement.report.addnew")}
                    </Button>
                  )}
                </TableToolbarContent>
              </TableToolbar>
              <Table {...getTableProps()}>
                <TableHead>
                  <TableRow>
                    <TableExpandHeader />
                    {canCreateReports && (
                      <TableHeader className="checkbox-column" />
                    )}
                    {headers.map(
                      (header: any, index) =>
                        header.key !== "details" &&
                        header.key !== "checkbox" && (
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
                          {row.cells.map((cell: any, index: any) => (
                            <React.Fragment key={cell.id}>
                              {canCreateReports &&
                                cell?.info?.header === "checkbox" && (
                                  <>
                                    {cell.value && (
                                      <TableSelectRow
                                        className="checkbox-column"
                                        {...getSelectionProps({ row })}
                                      />
                                    )}
                                    {!cell.value && (
                                      <TableCell>{cell.value}</TableCell>
                                    )}
                                  </>
                                )}
                              {cell?.info?.header !== "details" &&
                                cell?.info?.header !== "checkbox" && (
                                  <TableCell
                                    className={
                                      cell?.info?.header === "status"
                                        ? "report-status"
                                        : undefined
                                    }
                                    style={
                                      cell?.info?.header === "description"
                                        ? { paddingLeft: "0.5rem" }
                                        : {}
                                    }
                                  >
                                    {cell.value}
                                  </TableCell>
                                )}
                            </React.Fragment>
                          ))}
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
        {pagination.usePagination && (
          <Pagination
            page={pagination.currentPage}
            pageSize={pagination.pageSize}
            pageSizes={[10, 20, 30, 40, 50]}
            totalItems={pagination.totalItems}
            onChange={pagination.onChange}
            className={styles.paginationOverride}
            pagesUnknown={pagination?.pagesUnknown}
            isLastPage={pagination.lastPage}
          />
        )}
      </div>
    </>
  );
};

export default ReportTable;
