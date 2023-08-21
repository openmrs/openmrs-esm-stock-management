import { useTranslation } from "react-i18next";
import { useUserRoleScopes } from "./stock-user-role-scopes.resource";
import React, { useMemo, useState } from "react";
import {
  isDesktop,
  useLayoutType,
  usePagination,
} from "@openmrs/esm-framework";
import {
  DataTableSkeleton,
  DataTable,
  TableContainer,
  TableToolbar,
  TableToolbarContent,
  TableToolbarSearch,
  Table,
  TableHead,
  TableRow,
  Button,
  TableExpandHeader,
  TableBody,
  TableCell,
  TableHeader,
  Pagination,
  Tile,
} from "@carbon/react";
import { Add } from "@carbon/react/icons";
import styles from "./stock-user-role-scopes.scss";

function StockUserRoleScopesItems() {
  const { t } = useTranslation();

  const layout = useLayoutType();

  // get sources
  const { items, isLoading } = useUserRoleScopes({});

  const pageSizes = [10, 20, 30, 40, 50];
  const [currentPageSize, setPageSize] = useState(10);
  const {
    goTo,
    results: paginatedItems,
    currentPage,
  } = usePagination(items.results, currentPageSize);

  const tableHeaders = useMemo(
    () => [
      {
        id: 0,
        header: "User",
        key: "user",
      },

      {
        id: 1,
        header: "Role",
        key: "role",
      },
      {
        id: 2,
        header: "Location(s)",
        key: "location",
      },
      {
        id: 3,
        header: "Stock Operations",
        key: "stockOperations",
      },
      {
        id: 4,
        header: "Permanent ?",
        key: "permanent",
      },
      {
        id: 5,
        header: "Active From ",
        key: "from",
      },
      {
        id: 6,
        header: "Active To",
        key: "permanent",
      },
      {
        id: 7,
        header: "Enabled ?",
        key: "enabled",
      },
    ],
    []
  );

  const tableRows = useMemo(() => {
    return paginatedItems?.map((entry) => {
      return {
        ...entry,
      };
    });
  }, [paginatedItems]);

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
                totalItems={items?.results.length}
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
