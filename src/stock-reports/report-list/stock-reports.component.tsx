import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  DataTable,
  DataTableSkeleton,
  Link,
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
} from "@carbon/react";
import styles from "./stock-reports.scss";
import { isDesktop } from "@openmrs/esm-framework";

import NewReportActionButton from "./new-report-button.component";

const StockReports: React.FC = () => {
  const { t } = useTranslation();
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
        header: t("DateRequested", "Date Requested"),
        key: "DateRequested",
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

  const tableRows = useMemo(() => {
    return [];
  }, []);

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
        rows={tableRows ?? []}
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
                <NewReportActionButton />
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
            {rows.length === 0 ? (
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
    </div>
  );
};

export default StockReports;
