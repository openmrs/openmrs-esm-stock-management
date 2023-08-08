import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../root.module.scss";
import {
  URL_STOCK_HOME,
  URL_STOCK_ITEM,
  URL_STOCK_ITEMS,
  URL_STOCK_ITEMS_NEW,
} from "../constants";
import { ResourceRepresentation } from "../core/api/api";
import { StockItemFilter, useGetStockItemsQuery } from "../core/api/stockItem";
import { PageableResult } from "../core/api/types/PageableResult";
import { StockItemDTO } from "../core/api/types/stockItem/StockItem";
import { BreadCrumbs } from "../core/utils/breadCrumbs";
import useTranslation from "../core/utils/translation";
import StockItemListTable from "./stock-item-table.component";

const InitialResults: PageableResult<StockItemDTO> = {
  results: [],
  totalCount: 0,
  links: null,
};

const StockItemList = () => {
  const { t } = useTranslation();
  let navigate = useNavigate();
  useEffect(() => {
    new BreadCrumbs()
      .withHome()
      .withLabel(t("stockmanagement.dashboard.title"), URL_STOCK_HOME)
      .withLabel(t("stockmanagement.stockitem.list.title"), URL_STOCK_ITEMS)
      .generateBreadcrumbHtml();
  }, [t]);
  const [isDrug, setIsDrug] = useState("");
  const [stockItemFilter, setStockItemFilter] = useState<StockItemFilter>({
    startIndex: 0,
    v: ResourceRepresentation.Default,
    limit: 10,
    q: null,
    totalCount: true,
  });
  const [currentPage, setPageCount] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(10);
  const [searchString, setSearchString] = useState(null);
  useEffect(() => {
    setStockItemFilter({
      startIndex: currentPage - 1,
      v: ResourceRepresentation.Default,
      limit: currentPageSize,
      q: searchString,
      totalCount: true,
      isDrug: isDrug,
    });
  }, [searchString, currentPage, currentPageSize, isDrug]);
  const {
    data: stockItems,
    isFetching,
    isLoading,
    refetch: refetchStockItems,
  } = useGetStockItemsQuery(stockItemFilter, {
    refetchOnMountOrArgChange: true,
  });

  const handleSearch = useCallback((str) => {
    setPageCount(1);
    setSearchString(str);
  }, []);

  const handleItemTypeChange = useCallback((isDrug) => {
    setPageCount(1);
    setIsDrug(isDrug);
  }, []);

  const handleNew = useCallback(() => {
    navigate(URL_STOCK_ITEMS_NEW);
  }, [navigate]);

  const handleEdit = (uuid: string) => {
    navigate(URL_STOCK_ITEM(uuid));
  };

  const handleRefetchStockItems = () => {
    refetchStockItems();
  };

  return (
    <div className="stkpg-page">
      <div className="stkpg-page-header">
        <h1 className="stkpg-page-title">
          {t("stockmanagement.stockitem.list.title")}
        </h1>
        <h3
          className={`stkpg-page-subtitle ${styles.bodyShort02} ${styles.marginTop} ${styles.whiteSpacePreWrap}`}
        >
          {t("stockmanagement.stockitem.list.description")}
        </h3>
      </div>
      <div className="stkpg-page-body">
        <main className={`${styles.listDetailsPage}`}>
          <section>
            <div className={styles.tableContainer}>
              <StockItemListTable
                stockItems={stockItems ?? InitialResults}
                isLoading={isLoading}
                isFetching={isFetching}
                search={{
                  onSearch: handleSearch,
                  onItemTypeChange: handleItemTypeChange,
                  refetch: handleRefetchStockItems,
                  currentItemType: isDrug,
                }}
                createStockItem={handleNew}
                editStockItem={handleEdit}
                pagination={{
                  usePagination: true,
                  currentPage,
                  onChange: ({ page, pageSize }) => {
                    setPageCount(page);
                    setCurrentPageSize(pageSize);
                  },
                  pageSize: currentPageSize,
                  totalItems: stockItems?.totalCount || 0,
                  pagesUnknown: false,
                  lastPage:
                    (stockItems?.results?.length || 0) < currentPageSize ||
                    currentPage * currentPageSize === stockItems?.totalCount,
                }}
              />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default StockItemList;
