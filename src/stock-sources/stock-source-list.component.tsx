import React, { useCallback, useEffect, useState } from "react";
import { Splash } from "../components/spinner/Splash";
import {
  STOCK_SOURCE_TYPE_CODED_CONCEPT_ID,
  URL_STOCK_HOME,
  URL_STOCK_SOURCES,
} from "../constants";
import { ResourceRepresentation } from "../core/api/api";
import { useGetConceptByIdQuery } from "../core/api/lookups";
import {
  StockSourceFilter,
  useGetStockSourcesQuery,
  useLazyGetStockSourceQuery,
} from "../core/api/stockSource";
import { PageableResult } from "../core/api/types/PageableResult";
import { StockSource } from "../core/api/types/stockOperation/StockSource";
import { errorAlert } from "../core/utils/alert";
import { BreadCrumbs } from "../core/utils/breadCrumbs";
import { toErrorMessage } from "../core/utils/stringUtils";
import useTranslation from "../core/utils/translation";
import styles from "../root.module.scss";
import { ModalPopup } from "./modal-popup.component";
import StockSourceListTable from "./stock-source-table.component";

const InitialResults: PageableResult<StockSource> = {
  results: [],
  totalCount: 0,
  links: null,
};

const StockSourcesList = () => {
  const { t } = useTranslation();
  useEffect(() => {
    new BreadCrumbs()
      .withHome()
      .withLabel(t("stockmanagement.dashboard.title"), URL_STOCK_HOME)
      .withLabel(t("stockmanagement.stocksource.list.title"), URL_STOCK_SOURCES)
      .generateBreadcrumbHtml();
  }, [t]);
  const [editableModel, setEditableMode] = useState<StockSource | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [stockSourceFilter, setStockSourceFilter] = useState<StockSourceFilter>(
    {
      startIndex: 0,
      v: ResourceRepresentation.Default,
      limit: 10,
      q: null,
      totalCount: true,
      sourceTypeUuid: null,
    }
  );
  const [currentPage, setPageCount] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(10);
  const [searchString, setSearchString] = useState(null);
  const [sourceType, setSourceType] = useState<string | null | undefined>(null);
  useEffect(() => {
    setStockSourceFilter({
      startIndex: currentPage - 1,
      v: ResourceRepresentation.Default,
      limit: currentPageSize,
      q: searchString,
      totalCount: true,
      sourceTypeUuid: sourceType,
    });
  }, [searchString, currentPage, currentPageSize, sourceType]);
  const {
    data: stockSources,
    isFetching,
    isLoading,
    refetch: refetchStockSources,
  } = useGetStockSourcesQuery(stockSourceFilter, {
    refetchOnMountOrArgChange: true,
  });
  const [fetchStockSource, { isFetching: isFetchingStockSource }] =
    useLazyGetStockSourceQuery();
  const { data: stockSourceTypes } = useGetConceptByIdQuery(
    STOCK_SOURCE_TYPE_CODED_CONCEPT_ID
  );

  const handleSearch = useCallback((str) => {
    setPageCount(1);
    setSearchString(str);
  }, []);

  const handleNew = useCallback(() => {
    setEditableMode({} as unknown as StockSource);
    setOpenModal(true);
  }, []);

  const handleEdit = (uuid: string) => {
    fetchStockSource(uuid)
      .unwrap()
      .then((payload: any) => {
        if ((payload as any).error) {
          var errorMessage = toErrorMessage(payload);
          errorAlert(
            `${t("stockmanagement.stocksource.load.failed")} ${errorMessage}`
          );
          return;
        } else if (payload?.uuid === uuid) {
          setEditableMode(payload as StockSource);
          setOpenModal(true);
        }
      })
      .catch((error: any) => {
        var errorMessage = toErrorMessage(error);
        errorAlert(
          `${t("stockmanagement.stocksource.load.failed")} ${errorMessage}`
        );
        return;
      });
  };

  const handleRefetchStockSources = () => {
    refetchStockSources();
  };

  const handleStockSourceModalClose = () => {
    setOpenModal(false);
    setEditableMode(null);
  };

  return (
    <div className="stkpg-page">
      <div className="stkpg-page-header">
        <h1 className="stkpg-page-title">
          {t("stockmanagement.stocksource.list.title")}
        </h1>
        <h3
          className={`stkpg-page-subtitle ${styles.bodyShort02} ${styles.marginTop} ${styles.whiteSpacePreWrap}`}
        >
          {t("stockmanagement.stocksource.list.description")}
        </h3>
      </div>
      <div className="stkpg-page-body">
        <main className={`${styles.listDetailsPage}`}>
          <section>
            <div className={styles.tableContainer}>
              <StockSourceListTable
                stockSources={stockSources ?? InitialResults}
                stockSourceTypes={stockSourceTypes}
                isLoading={isLoading}
                isFetching={isFetching}
                search={{
                  onSearch: handleSearch,
                  refetch: handleRefetchStockSources,
                  setSourceType: setSourceType,
                  currentSourceType: sourceType,
                }}
                createStockSource={handleNew}
                editStockSource={handleEdit}
                pagination={{
                  usePagination: true,
                  currentPage,
                  onChange: ({ page, pageSize }) => {
                    setPageCount(page);
                    setCurrentPageSize(pageSize);
                  },
                  pageSize: currentPageSize,
                  totalItems: stockSources?.totalCount || 0,
                  pagesUnknown: false,
                  lastPage:
                    (stockSources?.results?.length || 0) < currentPageSize ||
                    currentPage * currentPageSize === stockSources?.totalCount,
                }}
              />
            </div>
          </section>
          {isFetchingStockSource && <Splash active={true} />}
          {openModal && !isFetchingStockSource && editableModel && (
            <ModalPopup
              onClose={handleStockSourceModalClose}
              model={editableModel}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default StockSourcesList;
