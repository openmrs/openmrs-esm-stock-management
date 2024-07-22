import React, { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  DataTable,
  DataTableSkeleton,
  TabPanel,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  TableToolbar,
  TableToolbarContent,
  TableToolbarSearch,
  Tile,
  Button,
  InlineLoading,
  TableToolbarMenu,
  TableToolbarAction,
} from "@carbon/react";
import { isDesktop, restBaseUrl, useSession } from "@openmrs/esm-framework";
import NewReportActionButton from "./new-report-button.component";
import styles from "./stock-reports.scss";
import { useGetReports } from "../stock-reports.resource";
import {
  URL_BATCH_JOB_ARTIFACT,
  APP_STOCKMANAGEMENT_REPORTS_VIEW,
  TASK_STOCKMANAGEMENT_REPORTS_MUTATE,
} from "../../constants";
import { formatDisplayDateTime } from "../../core/utils/datetimeUtils";
import {
  BatchJobStatusCancelled,
  BatchJobStatusCompleted,
  BatchJobStatusExpired,
  BatchJobStatusFailed,
  BatchJobStatusPending,
} from "../../core/api/types/BatchJob";
import {
  CheckmarkOutline,
  Copy,
  Download,
  IncompleteCancel,
  MisuseOutline,
  View,
  WarningAltFilled,
} from "@carbon/react/icons";
import { handleMutate } from "../../utils";
import { PrivilagedView } from "../../core/components/privilages-component/privilages.component";

const StockReports: React.FC = () => {
  const { t } = useTranslation();

  const handleRefresh = () => {
    handleMutate(`${restBaseUrl}/stockmanagement/report?v=default`);
  };
  const {
    reports,
    isLoading,
    currentPage,
    pageSizes,
    totalItems,
    goTo,
    currentPageSize,
    setPageSize,
  } = useGetReports();

  const { user } = useSession();

  const canViewReports =
    user.privileges.filter(
      (privilage) => privilage.display === APP_STOCKMANAGEMENT_REPORTS_VIEW
    ).length > 0;

  const canCreateReport =
    user.privileges.filter(
      (privilage) => privilage.display === TASK_STOCKMANAGEMENT_REPORTS_MUTATE
    ).length > 0;

  const tableHeaders = useMemo(
    () => [
      {
        id: 0,
        header: t("report", "Report"),
        key: "report",
      },

      {
        id: 1,
        header: t("parameters", "Parameters"),
        key: "parameters",
      },
      {
        id: 2,
        header: t("dateRequested", "Date Requested"),
        key: "dateRequested",
      },
      {
        id: 3,
        header: t("requestedBy", "Requested By"),
        key: "requestedBy",
      },
      {
        id: 4,
        header: t("status", "Status"),
        key: "status",
      },
      {
        id: 8,
        header: t("actions", "Actions"),
        key: "actions",
      },
    ],
    []
  );

  const onDownloadReportClick = useCallback(
    (uuid: string, fileExit: string | undefined | null) => {
      if (uuid) {
        window.open(URL_BATCH_JOB_ARTIFACT(uuid, true), "_blank");
      }
    },
    []
  );

  const tableRows = useMemo(() => {
    return reports?.map((batchJob) => ({
      ...batchJob,
      checkbox: "isBatchJobActive",
      id: batchJob?.uuid,
      key: `key-${batchJob?.uuid}`,
      uuid: `${batchJob?.uuid}`,
      batchJobType: batchJob.batchJobType,
      dateRequested: formatDisplayDateTime(batchJob.dateCreated),
      parameters: "",
      report: batchJob.description,
      requestedBy: batchJob?.owners?.map((p, index) => (
        <div
          key={`${batchJob.uuid}-owner-${index}`}
        >{`${p.ownerFamilyName} ${p.ownerGivenName}`}</div>
      )),
      status: (
        <>
          {batchJob.status === BatchJobStatusPending && (
            <InlineLoading
              status="active"
              iconDescription="Loading"
              description="Generating report..."
            />
          )}
          {batchJob.status === BatchJobStatusFailed && (
            <WarningAltFilled
              className="report-failed"
              title={batchJob.status}
            />
          )}
          {batchJob.status === BatchJobStatusCancelled && (
            <MisuseOutline
              className="report-cancelled"
              title={batchJob.status}
            />
          )}
          {batchJob.status === BatchJobStatusCompleted && (
            <CheckmarkOutline
              className="report-completed"
              title={batchJob.status}
              size={16}
            />
          )}
          {batchJob.status === BatchJobStatusExpired && (
            <IncompleteCancel
              className="report-expired"
              title={batchJob.status}
            />
          )}
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
                renderIcon={View}
                // onClick={(e) => onViewItem(batchJob.uuid, e)}
              />
            )}
          <Button
            type="button"
            size="sm"
            className="submitButton clear-padding-margin"
            iconDescription={"Copy"}
            kind="ghost"
            renderIcon={Copy}
            // onClick={() => onCloneReportClick(batchJob.uuid)}
          />
          {batchJob?.status === BatchJobStatusCompleted &&
            (batchJob.outputArtifactSize ?? 0) > 0 && (
              <Button
                type="button"
                size="sm"
                className="submitButton clear-padding-margin"
                iconDescription={"Download"}
                kind="ghost"
                renderIcon={Download}
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
    }));
  }, [reports, onDownloadReportClick]);

  if (isLoading) {
    return <DataTableSkeleton role="progressbar" />;
  }

  return (
    <div className={styles.tableOverride}>
      <TabPanel>
        {t("ReportDescription", "List of reports requested by users")}
      </TabPanel>
      <div id="table-tool-bar">
        <div></div>
        <div className="right-filters"></div>
      </div>
      <DataTable
        rows={tableRows}
        headers={tableHeaders}
        isSortable={true}
        useZebraStyles={true}
        render={({
          rows,
          headers,
          getHeaderProps,
          getTableProps,
          getRowProps,
          onInputChange,
        }) => (
          <TableContainer>
            <TableToolbar
              style={{
                position: "static",
                overflow: "visible",
                backgroundColor: "color",
              }}
            >
              <TableToolbarContent className={styles.toolbarContent}>
                <TableToolbarSearch persistent onChange={onInputChange} />
                <TableToolbarMenu>
                  <TableToolbarAction onClick={handleRefresh}>
                    Refresh
                  </TableToolbarAction>
                </TableToolbarMenu>
                {canCreateReport && <NewReportActionButton />}
              </TableToolbarContent>
            </TableToolbar>
            <Table {...getTableProps()}>
              <TableHead>
                <TableRow>
                  {headers.map(
                    (header: any) =>
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
                          key={`${header.key}`}
                        >
                          {header.header?.content ?? header.header}
                        </TableHeader>
                      )
                  )}
                  <TableHeader></TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row: any) => {
                  return (
                    <React.Fragment key={row.id}>
                      <TableRow
                        className={
                          isDesktop ? styles.desktopRow : styles.tabletRow
                        }
                        {...getRowProps({ row })}
                      >
                        {row.cells.map(
                          (cell: any) =>
                            cell?.info?.header !== "details" && (
                              <TableCell key={cell.id}>{cell.value}</TableCell>
                            )
                        )}
                      </TableRow>
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
            {!canViewReports ? (
              <PrivilagedView
                title="Can not view stock reports"
                description="You have no permissions to view reports"
              />
            ) : rows.length === 0 ? (
              <div className={styles.tileContainer}>
                <Tile className={styles.tile}>
                  <div className={styles.tileContent}>
                    <p className={styles.content}>
                      {t("noReportsToDisplay", "No Stock reports to display")}
                    </p>
                    <p className={styles.helper}>
                      {t("checkFilters", "Check the filters above")}
                    </p>
                  </div>
                </Tile>
              </div>
            ) : null}
          </TableContainer>
        )}
      ></DataTable>
      <Pagination
        page={currentPage}
        pageSize={currentPageSize}
        pageSizes={pageSizes}
        totalItems={totalItems}
        onChange={({ pageSize, page }) => {
          if (pageSize !== currentPageSize) {
            setPageSize(pageSize);
          }
          if (page !== currentPage) {
            goTo(page);
          }
        }}
        className={styles.paginationOverride}
      />
    </div>
  );
};

export default StockReports;
