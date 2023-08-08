import React, { useCallback, useEffect, useMemo, useState } from "react";
import styles from "../../root.module.scss";
import { URL_STOCK_HOME, URL_STOCK_REPORTS } from "../constants";
import { ResourceRepresentation } from "../core/api/api";
import {
  BatchJobFilter,
  useGetBatchJobsQuery,
  useGetReportTypesQuery,
} from "../core/api/batchJob";
import { useGetPartiesQuery } from "../core/api/lookups";
import { BatchJob, BatchJobTypeReport } from "../core/api/types/BatchJob";
import { PageableResult } from "../core/api/types/PageableResult";
import {
  APP_STOCKMANAGEMENT_REPORTS,
  TASK_STOCKMANAGEMENT_REPORTS_MUTATE,
} from "../core/privileges";
import { BreadCrumbs } from "../core/utils/breadCrumbs";
import useTranslation from "../core/utils/translation";
import { useGetPrivilegeScopes } from "../stock-auth/AccessControl";
import ReportTable from "./stock-report-table.component";

const InitialResults: PageableResult<BatchJob> = {
  results: [],
  totalCount: 0,
  links: null,
};

export const ReportList = () => {
  const { t } = useTranslation();
  useEffect(() => {
    new BreadCrumbs()
      .withHome()
      .withLabel(t("stockmanagement.dashboard.title"), URL_STOCK_HOME)
      .withLabel(t("stockmanagement.report.list.title"), URL_STOCK_REPORTS)
      .generateBreadcrumbHtml();
  }, [t]);
  const [currentPage, setPageCount] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(10);
  const [searchString, setSearchString] = useState("");
  const [batchJobStatus, setBatchJobStatus] = useState<string>();
  const [locationScopeUuid, setlocationScopeUuid] = useState<string>();
  const [dateCreatedMin, setDateCreatedMin] = useState<string>();
  const [dateCreatedMax, setDateCreatedMax] = useState<string>();
  const [completedDateMin, setCompletedDateMin] = useState<string>();
  const [completedDateMax, setCompletedDateMax] = useState<string>();
  const [batchJobFilter, setBatchJobFilter] = useState<BatchJobFilter>({
    startIndex: 0,
    batchJobType: BatchJobTypeReport,
    v: ResourceRepresentation.Default,
    limit: 10,
    q: "",
    totalCount: true,
    completedDateMax: completedDateMax,
    completedDateMin: completedDateMin,
    dateCreatedMax: dateCreatedMax,
    dateCreatedMin: dateCreatedMin,
    locationScopeUuid: locationScopeUuid,
    status: batchJobStatus,
  });
  const {
    data: batchJobs,
    isFetching,
    isLoading,
    refetch: refetchBatchJobs,
  } = useGetBatchJobsQuery(batchJobFilter, { refetchOnMountOrArgChange: true });
  const { data: reportTypes, isLoading: isLoadingReportTypes } =
    useGetReportTypesQuery();
  const userPrivilegeScopes = useGetPrivilegeScopes([
    APP_STOCKMANAGEMENT_REPORTS,
    TASK_STOCKMANAGEMENT_REPORTS_MUTATE,
  ]);
  const { data: partyList, isLoading: isLoadingPartyList } =
    useGetPartiesQuery();

  useEffect(() => {
    setBatchJobFilter({
      startIndex: currentPage - 1,
      batchJobType: BatchJobTypeReport,
      v: ResourceRepresentation.Default,
      limit: currentPageSize,
      q: searchString,
      totalCount: true,
      completedDateMax: completedDateMax,
      completedDateMin: completedDateMin,
      dateCreatedMax: dateCreatedMax,
      dateCreatedMin: dateCreatedMin,
      locationScopeUuid: locationScopeUuid,
      status: batchJobStatus,
    });
  }, [
    searchString,
    currentPage,
    currentPageSize,
    completedDateMax,
    completedDateMin,
    dateCreatedMax,
    dateCreatedMin,
    locationScopeUuid,
    batchJobStatus,
  ]);

  const handleSearch = useCallback((str) => {
    setSearchString(str ?? "");
  }, []);

  const handleRefetchBatchJobs = () => {
    refetchBatchJobs();
  };

  const gridPartyLookupList = useMemo(() => {
    if (!userPrivilegeScopes || !partyList) {
      return [];
    }
    let locationUuids = userPrivilegeScopes
      ?.filter(
        (p) => p.locationUuid && p.privilege === APP_STOCKMANAGEMENT_REPORTS
      )
      .map((p) => p.locationUuid);
    return partyList.results.filter((p) =>
      locationUuids.includes(p.locationUuid)
    );
  }, [userPrivilegeScopes, partyList]);

  const partyLookupList = useMemo(() => {
    if (!userPrivilegeScopes || !partyList) {
      return [];
    }
    let locationUuids = userPrivilegeScopes
      ?.filter(
        (p) =>
          p.locationUuid && p.privilege === TASK_STOCKMANAGEMENT_REPORTS_MUTATE
      )
      .map((p) => p.locationUuid);
    return partyList.results
      .filter((p) => locationUuids.includes(p.locationUuid))
      .sort((a, b) =>
        a.name.toLocaleLowerCase().localeCompare(b.name.toLocaleLowerCase())
      );
  }, [userPrivilegeScopes, partyList]);

  const stockSourceList = useMemo(() => {
    if (!partyList) {
      return [];
    }
    return partyList.results.filter((p) => p.stockSourceUuid);
  }, [partyList]);

  return (
    <div className="stkpg-page">
      <div className="stkpg-page-header">
        <h1 className="stkpg-page-title">
          {t("stockmanagement.report.list.title")}
        </h1>
        <h3
          className={`stkpg-page-subtitle ${styles.bodyShort02} ${styles.marginTop} ${styles.whiteSpacePreWrap}`}
        >
          {t("stockmanagement.report.list.description")}
        </h3>
      </div>
      <div className="stkpg-page-body">
        <main className={`${styles.listDetailsPage}`}>
          <section>
            <div className={styles.tableContainer}>
              <ReportTable
                batchJobs={batchJobs ?? InitialResults}
                partyLookupList={partyLookupList}
                stockSourceList={stockSourceList}
                gridPartyLookupList={gridPartyLookupList}
                reportTypes={reportTypes}
                isLoading={
                  isLoading || isLoadingReportTypes || isLoadingPartyList
                }
                isFetching={isFetching}
                search={{
                  onSearch: handleSearch,
                  refetch: handleRefetchBatchJobs,
                  onCompletedDateChange: (a, b) => {
                    setCompletedDateMax(b);
                    setCompletedDateMin(a);
                  },
                  onDateCreatedChange: (a, b) => {
                    setDateCreatedMax(b);
                    setDateCreatedMin(a);
                  },
                  onLocationScopeChange: (p) => setlocationScopeUuid(p),
                  onStatusChange: (p) => setBatchJobStatus(p),
                }}
                pagination={{
                  usePagination: true,
                  currentPage,
                  onChange: ({ page, pageSize }) => {
                    setPageCount(page);
                    setCurrentPageSize(pageSize);
                  },
                  pageSize: currentPageSize,
                  totalItems: batchJobs?.totalCount || 0,
                  pagesUnknown: false,
                  lastPage:
                    (batchJobs?.results?.length || 0) < currentPageSize ||
                    currentPage * currentPageSize === batchJobs?.totalCount,
                }}
              />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default ReportList;
