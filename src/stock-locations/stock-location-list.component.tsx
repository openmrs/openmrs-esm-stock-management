import React, { useCallback, useEffect, useState } from "react";
import styles from "../../root.module.scss";
import { URL_LOCATIONS, URL_STOCK_HOME } from "../constants";
import { ResourceRepresentation } from "../core/api/api";
import {
  LocationFilterCriteria,
  useGetLocationTagsQuery,
  useGetLocationsQuery,
} from "../core/api/lookups";
import { OpenMRSLocation } from "../core/api/types/Location";
import { PageableResult } from "../core/api/types/PageableResult";
import { BreadCrumbs } from "../core/utils/breadCrumbs";
import useTranslation from "../core/utils/translation";
import LocationTable from "./stock-location-table.component";

const InitialResults: PageableResult<OpenMRSLocation> = {
  results: [],
  totalCount: 0,
  links: null,
};

export const LocationList = () => {
  const { t } = useTranslation();
  useEffect(() => {
    new BreadCrumbs()
      .withHome()
      .withLabel(t("stockmanagement.dashboard.title"), URL_STOCK_HOME)
      .withLabel(t("stockmanagement.location.list.title"), URL_LOCATIONS)
      .generateBreadcrumbHtml();
  }, [t]);
  const [currentPage, setPageCount] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(50);
  const [searchString, setSearchString] = useState("");
  const [locationFilter, setLocationFilter] = useState<LocationFilterCriteria>({
    startIndex: 0,
    v: ResourceRepresentation.Default,
    limit: 50,
    q: "",
    totalCount: true,
  });
  const {
    data: locations,
    isFetching,
    isLoading,
    refetch: refetchLocations,
  } = useGetLocationsQuery(locationFilter, { refetchOnMountOrArgChange: true });
  const { data: locationTags } = useGetLocationTagsQuery(null);

  useEffect(() => {
    setLocationFilter({
      startIndex: currentPage - 1,
      v: ResourceRepresentation.Default,
      limit: currentPageSize,
      q: searchString,
      totalCount: true,
    });
  }, [searchString, currentPage, currentPageSize]);

  const handleSearch = useCallback((str) => {
    setSearchString(str ?? "");
  }, []);

  const handleRefetchLocations = () => {
    refetchLocations();
  };

  return (
    <div className="stkpg-page">
      <div className="stkpg-page-header">
        <h1 className="stkpg-page-title">
          {t("stockmanagement.location.list.title")}
        </h1>
        <h3
          className={`stkpg-page-subtitle ${styles.bodyShort02} ${styles.marginTop} ${styles.whiteSpacePreWrap}`}
        >
          {t("stockmanagement.location.list.description")}
        </h3>
      </div>
      <div className="stkpg-page-body">
        <main className={`${styles.listDetailsPage}`}>
          <section>
            <div className={styles.tableContainer}>
              <LocationTable
                locations={locations ?? InitialResults}
                locationTags={locationTags}
                isLoading={isLoading}
                isFetching={isFetching}
                search={{
                  onSearch: handleSearch,
                  refetch: handleRefetchLocations,
                }}
                pagination={{
                  usePagination: true,
                  currentPage,
                  onChange: ({ page, pageSize }) => {
                    setPageCount(page);
                    setCurrentPageSize(pageSize);
                  },
                  pageSize: currentPageSize,
                  totalItems: locations?.totalCount || 0,
                  pagesUnknown: false,
                  lastPage:
                    (locations?.results?.length || 0) < currentPageSize ||
                    currentPage * currentPageSize === locations?.totalCount,
                }}
              />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default LocationList;
