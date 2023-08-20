import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useStockSources } from "./stock-sources.resource";
import {
  DataTable,
  DataTableSkeleton,
  TableContainer,
  Layer,
  TableToolbarContent,
  TableToolbarSearch,
  TableToolbar,
  Table,
  TableHead,
  TableRow,
  TableExpandHeader,
  TableHeader,
  TableBody,
  Tile,
  Button,
  TableCell,
  Pagination,
} from "@carbon/react";
import styles from "./stock-sources.scss";
import { Add } from "@carbon/react/icons";
import { usePagination } from "@openmrs/esm-framework";

function StockSourcesItems() {
  const { t } = useTranslation();

  // get sources
  const { isLoading, isError, items } = useStockSources({});

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
        header: "uuid",
        key: "uuid",
      },

      {
        id: 1,
        header: "name",
        key: "name",
      },
      {
        id: 2,
        header: "Acronym",
        key: "acronym",
      },
      {
        id: 3,
        header: "Source Type",
        key: "sourceType",
      },
    ],
    []
  );

  const tableRows = useMemo(() => {
    return paginatedItems?.map((entry) => {
      return {
        ...entry,
        uuid: entry?.uuid,
        name: entry?.name,
        acronym: entry?.acronym,
        sourceType: entry?.sourceType?.display,
      };
    });
  }, [paginatedItems]);

  if (isLoading) {
    return <DataTableSkeleton role="progressbar" />;
  }

  if (paginatedItems?.length) {
    <DataTable
      data-floating-menu-container
      headers={tableHeaders}
      isSortable
      size="xs"
      rows={tableRows}
      useZebraStyles
    >
      {({
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
              height: "3rem",
              overflow: "visible",
              backgroundColor: "color",
            }}
          >
            <TableToolbarContent>
              <Layer>
                <TableToolbarSearch
                  onChange={onInputChange}
                  placeholder={t("searchThisList", "Search this list")}
                  size="sm"
                />
              </Layer>
            </TableToolbarContent>
          </TableToolbar>
          <Table {...getTableProps()}>
            <TableHead>
              <TableRow>
                <TableExpandHeader />
                {headers.map((header) => (
                  <TableHeader {...getHeaderProps({ header })}>
                    {header.header}
                  </TableHeader>
                ))}
                <TableExpandHeader />
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => {
                return (
                  <React.Fragment key={row.id}>
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
    </DataTable>;
  }

  return (
    <div className={styles.tileContainer}>
      <Tile className={styles.tile}>
        <div className={styles.tileContent}>
          <p className={styles.content}>
            {t("noSourcesToDisplay", "No Sources to display")}
          </p>
          <p className={styles.helper}>
            {t("checkFilters", "Check the filters above")}
          </p>
        </div>
        <p className={styles.separator}>{t("or", "or")}</p>
        <Button
          kind="ghost"
          size="sm"
          renderIcon={(props) => <Add size={16} {...props} />}
        >
          {t("addSourcestolist", "Add Sources to list")}
        </Button>
      </Tile>
    </div>
  );
}

export default StockSourcesItems;
