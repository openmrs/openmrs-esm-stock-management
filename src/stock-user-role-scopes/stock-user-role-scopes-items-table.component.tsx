import { useTranslation } from "react-i18next";
import React from "react";
import { isDesktop, useLayoutType } from "@openmrs/esm-framework";
import {
  Button,
  DataTable,
  DataTableSkeleton,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableExpandHeader,
  TableHead,
  TableHeader,
  TableRow,
  TableToolbar,
  TableToolbarContent,
  TableToolbarSearch,
  Tile,
} from "@carbon/react";
import { Add } from "@carbon/react/icons";
import styles from "./stock-user-role-scopes.scss";
import { ResourceRepresentation } from "../core/api/api";
import useStockUserRoleScopesPage from "./stock-user-role-scopes-items-table.resource";

function StockUserRoleScopesItems() {
  const { t } = useTranslation();

  const layout = useLayoutType();

  // get sources
  const {
    isLoading,
    paginatedItems,
    tableHeaders,
    tableRows,
    currentPage,
    currentPageSize,
    goTo,
    pageSizes,
    items,
    setPageSize,
  } = useStockUserRoleScopesPage({ v: ResourceRepresentation.Full });

  if (isLoading) {
    return <DataTableSkeleton role="progressbar" />;
  }

  if (paginatedItems?.length) {
    return (
      <div className={styles.container}>
        <div className={styles.headerBtnContainer}></div>
        <div className={styles.headerContainer}>
          <div
            className={
              !isDesktop(layout) ? styles.tabletHeading : styles.desktopHeading
            }
          >
            <span className={styles.heading}>{`Stock Sources`}</span>
          </div>
        </div>
        <DataTable
          data-floating-menu-container
          headers={tableHeaders}
          size="xs"
          isSortable
          rows={tableRows}
          useZebraStyles
          overflowMenuOnHover={isDesktop(layout)}
        >
          {({
            rows,
            headers,
            getHeaderProps,
            getTableProps,
            getRowProps,
            onInputChange,
          }) => (
            <TableContainer className={styles.tableContainer}>
              <TableToolbar
                style={{
                  position: "static",
                  height: "3rem",
                  overflow: "visible",
                  backgroundColor: "color",
                }}
              >
                <TableToolbarContent className={styles.toolbarContent}>
                  <TableToolbarSearch
                    className={styles.search}
                    onChange={onInputChange}
                    placeholder={t("searchThisList", "Search this list")}
                    size="sm"
                  />
                  <div className={styles.headerButtons}>
                    <Button>Add Source</Button>
                  </div>
                </TableToolbarContent>
              </TableToolbar>
              <Table {...getTableProps()} className={styles.stockSourcesTable}>
                <TableHead>
                  <TableRow>
                    <TableExpandHeader />
                    {headers.map((header) => (
                      <TableHeader
                        {...getHeaderProps({ header })}
                        key={`${header.key}`}
                      >
                        {header.header}
                      </TableHeader>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => {
                    return (
                      <React.Fragment key={row.uuid}>
                        <TableRow {...getRowProps({ row })}>
                          {row.cells.map((cell) => (
                            <TableCell key={cell.id}>{cell.value}</TableCell>
                          ))}
                        </TableRow>
                      </React.Fragment>
                    );
                  })}
                </TableBody>
              </Table>
              <Pagination
                forwardText="Next page"
                backwardText="Previous page"
                page={currentPage}
                pageSize={currentPageSize}
                pageSizes={pageSizes}
                totalItems={items?.length}
                className={styles.pagination}
                onChange={({ pageSize, page }) => {
                  if (pageSize !== currentPageSize) {
                    setPageSize(pageSize);
                  }
                  if (page !== currentPage) {
                    goTo(page);
                  }
                }}
              />
            </TableContainer>
          )}
        </DataTable>
      </div>
    );
  }

  return (
    <div className={styles.tileContainer}>
      <Tile className={styles.tile}>
        <div className={styles.tileContent}>
          <p className={styles.content}>
            {t("noUserRoleScopes", "No User Scopes to display")}
          </p>
          <p className={styles.helper}>
            {t("noUserRoleScopes", "Check the filters above")}
          </p>
        </div>
        <p className={styles.separator}>{t("or", "or")}</p>
        <Button
          kind="ghost"
          size="sm"
          renderIcon={(props) => <Add size={16} {...props} />}
        >
          {t("addScopestolist", "Add Scopes to list")}
        </Button>
      </Tile>
    </div>
  );
}

export default StockUserRoleScopesItems;
