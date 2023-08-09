import { ComboBox } from "@carbon/react";
import { debounce } from "lodash-es";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../root.module.scss";
import { useAppSelector } from "../app/hooks";
import {
  ALLOW_STOCK_ISSUE_WITHOUT_REQUISITION,
  STOCK_SOURCE_TYPE_CODED_CONCEPT_ID,
  URL_STOCK_HOME,
  URL_STOCK_OPERATION,
  URL_STOCK_OPERATIONS,
  URL_STOCK_OPERATIONS_NEW,
} from "../constants";
import { ResourceRepresentation } from "../core/api/api";
import {
  useGetConceptByIdQuery,
  useGetStockOperationTypesQuery,
  useLazyGetPartiesQuery,
} from "../core/api/lookups";
import {
  StockItemFilter,
  useLazyGetStockItemsQuery,
} from "../core/api/stockItem";
import {
  StockOperationFilter,
  useGetStockOperationsQuery,
} from "../core/api/stockOperation";
import { PageableResult } from "../core/api/types/PageableResult";
import { Party } from "../core/api/types/Party";
import { StockItemDTO } from "../core/api/types/stockItem/StockItem";
import {
  LocationTypeLocation,
  LocationTypeOther,
} from "../core/api/types/stockOperation/LocationType";
import { StockOperationDTO } from "../core/api/types/stockOperation/StockOperationDTO";
import {
  StockOperationType,
  StockOperationTypeIsStockIssue,
} from "../core/api/types/stockOperation/StockOperationType";
import { TASK_STOCKMANAGEMENT_STOCKOPERATIONS_MUTATE } from "../core/privileges";
import { errorAlert } from "../core/utils/alert";
import { BreadCrumbs } from "../core/utils/breadCrumbs";
import { toErrorMessage } from "../core/utils/stringUtils";
import useTranslation from "../core/utils/translation";
import { selectPrivilegeScopes } from "../stock-auth/authSlice";
import StockOperationListTable from "./stock-operation-table.component";

const InitialResults: PageableResult<StockOperationDTO> = {
  results: [],
  totalCount: 0,
  links: null,
};

const StockOperationList = () => {
  const { t } = useTranslation();
  let navigate = useNavigate();
  useEffect(() => {
    new BreadCrumbs()
      .withHome()
      .withLabel(t("stockmanagement.dashboard.title"), URL_STOCK_HOME)
      .withLabel(
        t("stockmanagement.stockoperation.list.title"),
        URL_STOCK_OPERATIONS
      )
      .generateBreadcrumbHtml();
  }, [t]);
  const [status, setStatus] = useState<string | null>("");
  const [operationTypeUuid, setOperationTypeUuid] = useState<
    string | null | undefined
  >(null);
  const [sourceTypeUuid, setSourceTypeUuid] = useState<
    string | null | undefined
  >(null);
  const [locationUuid, setLocationUuid] = useState<string | null | undefined>(
    null
  );
  const [stockItemUuid, setStockItemUuid] = useState<string | null | undefined>(
    null
  );
  const [operationDateMin, setOperationDateMin] = useState<
    string | null | undefined
  >(null);
  const [operationDateMax, setOperationDateMax] = useState<
    string | null | undefined
  >(null);
  const [isLocationOther, setIsLocationOther] = useState<
    Boolean | null | undefined
  >(null);
  const { data: stockOperationTypes } = useGetStockOperationTypesQuery();
  const userPrivilegeScopes = useAppSelector(selectPrivilegeScopes);
  const { data: sourceTypes } = useGetConceptByIdQuery(
    STOCK_SOURCE_TYPE_CODED_CONCEPT_ID
  );
  const [stockItemSearchResult, setStockItemSearchResult] = useState<
    StockItemDTO[]
  >([]);
  const [getStockItems] = useLazyGetStockItemsQuery();
  const [getPartyList, { data: allParties }] = useLazyGetPartiesQuery();

  const [stockOperationFilter, setStockOperationFilter] =
    useState<StockOperationFilter>({
      startIndex: 0,
      v: ResourceRepresentation.Default,
      limit: 10,
      q: null,
      totalCount: true,
      status: status,
      operationTypeUuid: operationTypeUuid,
      locationUuid: locationUuid,
      stockItemUuid: stockItemUuid,
      operationDateMin: operationDateMin,
      operationDateMax: operationDateMax,
      isLocationOther: isLocationOther,
      sourceTypeUuid: sourceTypeUuid,
    });
  const [currentPage, setPageCount] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(10);
  const [searchString, setSearchString] = useState(null);

  useEffect(() => {
    async function loadStockOperationData() {
      await getPartyList()
        .unwrap()
        .then((payload: any) => {
          if ((payload as any).error) {
            var errorMessage = toErrorMessage(payload);
            errorAlert(`Load locations failed. ${errorMessage}`);
            return;
          }
        })
        .catch((error: any) => {
          var errorMessage = toErrorMessage(error);
          errorAlert(`Load locations failed. ${errorMessage}`);
        });
    }
    loadStockOperationData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setStockOperationFilter({
      startIndex: currentPage - 1,
      v: ResourceRepresentation.Default,
      limit: currentPageSize,
      q: searchString,
      totalCount: true,
      status: status,
      operationTypeUuid: operationTypeUuid,
      locationUuid: locationUuid,
      stockItemUuid: stockItemUuid,
      operationDateMin: operationDateMin,
      operationDateMax: operationDateMax,
      isLocationOther: isLocationOther,
      sourceTypeUuid: sourceTypeUuid,
    });
  }, [
    searchString,
    currentPage,
    currentPageSize,
    status,
    operationTypeUuid,
    locationUuid,
    stockItemUuid,
    operationDateMin,
    operationDateMax,
    isLocationOther,
    sourceTypeUuid,
  ]);
  const {
    data: stockOperations,
    isFetching,
    isLoading,
    refetch: refetchStockOperations,
  } = useGetStockOperationsQuery(stockOperationFilter, {
    refetchOnMountOrArgChange: true,
  });

  const handleSearch = useCallback((str) => {
    setPageCount(1);
    setSearchString(str);
  }, []);

  const handleNew = useCallback(() => {
    navigate(URL_STOCK_OPERATIONS_NEW);
  }, [navigate]);

  const handleEdit = (uuid: string) => {
    navigate(URL_STOCK_OPERATION(uuid));
  };

  // operation types the user is able to create
  const filterOperationTypes = useMemo(() => {
    let result: StockOperationType[] | undefined = [];
    let applicablePrivilegeScopes = userPrivilegeScopes?.map(
      (p) => p.operationTypeUuid
    );
    if (applicablePrivilegeScopes && applicablePrivilegeScopes.length > 0) {
      applicablePrivilegeScopes = [...new Set(applicablePrivilegeScopes)];
      result = stockOperationTypes?.results?.filter((p) =>
        applicablePrivilegeScopes?.includes(p.uuid)
      );
    }
    return result ?? ([] as StockOperationType[]);
  }, [userPrivilegeScopes, stockOperationTypes]);

  const createOperationTypes = useMemo(() => {
    let result: StockOperationType[] | undefined = [];
    let applicablePrivilegeScopes = userPrivilegeScopes
      ?.filter(
        (p) => p.privilege === TASK_STOCKMANAGEMENT_STOCKOPERATIONS_MUTATE
      )
      ?.map((p) => p.operationTypeUuid);
    if (applicablePrivilegeScopes && applicablePrivilegeScopes.length > 0) {
      result = stockOperationTypes?.results?.filter((p) =>
        applicablePrivilegeScopes?.includes(p.uuid)
      );
    }
    if (
      result &&
      result.length > 0 &&
      allParties &&
      allParties.results.length > 0
    ) {
      let partyList: Party[] = allParties.results;
      result = result.filter((currentStockOperationType) => {
        if (
          StockOperationTypeIsStockIssue(
            currentStockOperationType.operationType
          ) &&
          !ALLOW_STOCK_ISSUE_WITHOUT_REQUISITION
        ) {
          return false;
        }
        let operationTypePrivileges = userPrivilegeScopes?.filter(
          (p) =>
            p.privilege === TASK_STOCKMANAGEMENT_STOCKOPERATIONS_MUTATE &&
            p.operationTypeUuid === currentStockOperationType?.uuid
        );
        if (!operationTypePrivileges || operationTypePrivileges.length === 0) {
          return false;
        }
        let sourceTags =
          currentStockOperationType?.stockOperationTypeLocationScopes
            ?.filter((p) => currentStockOperationType?.hasSource && p.isSource)
            .map((p) => p.locationTag) ?? [];
        let destinationTags =
          currentStockOperationType?.stockOperationTypeLocationScopes
            ?.filter(
              (p) =>
                currentStockOperationType?.hasDestination && p.isDestination
            )
            .map((p) => p.locationTag) ?? [];
        let requiredSources: string[] | null = null;
        let requiredDestinations: string[] | null = null;
        if (
          currentStockOperationType?.hasSource &&
          currentStockOperationType?.sourceType === LocationTypeLocation
        ) {
          requiredSources = operationTypePrivileges.map((p) => p.locationUuid!);
        } else if (
          currentStockOperationType?.hasDestination &&
          currentStockOperationType?.destinationType === LocationTypeLocation
        ) {
          requiredDestinations = operationTypePrivileges.map(
            (p) => p.locationUuid!
          );
        }
        if (requiredSources == null && requiredDestinations == null) {
          return false;
        }

        if (currentStockOperationType?.hasSource) {
          let result = partyList?.filter(
            (p) =>
              (p.locationUuid &&
                currentStockOperationType?.sourceType ===
                  LocationTypeLocation &&
                (sourceTags.length === 0 ||
                  (p.tags && sourceTags.some((x) => p.tags.includes(x))))) ||
              (p.stockSourceUuid &&
                currentStockOperationType?.sourceType === LocationTypeOther)
          );
          if (requiredSources) {
            result = result.filter((p) =>
              requiredSources?.includes(p.locationUuid)
            );
            if (result.length === 0) {
              return false;
            }
            return true;
          }
        }

        if (currentStockOperationType?.hasDestination) {
          let result = partyList?.filter(
            (p) =>
              (p.locationUuid &&
                currentStockOperationType?.destinationType ===
                  LocationTypeLocation &&
                (destinationTags.length === 0 ||
                  (p.tags &&
                    destinationTags.some((x) => p.tags.includes(x))))) ||
              (p.stockSourceUuid &&
                currentStockOperationType?.destinationType ===
                  LocationTypeOther)
          );
          if (requiredDestinations) {
            result = result.filter((p) =>
              requiredDestinations?.includes(p.locationUuid)
            );
            if (result.length === 0) {
              return false;
            }
            return true;
          }
        }
        return false;
      });
    }
    return result ?? ([] as StockOperationType[]);
  }, [userPrivilegeScopes, stockOperationTypes?.results, allParties]);

  const onStockItemChanged = (data: { selectedItem: any }) => {
    let selectedStockItemUuid: string | null = null;
    if (data.selectedItem) {
      selectedStockItemUuid = data.selectedItem?.uuid;
    }
    setStockItemUuid(selectedStockItemUuid);
  };

  const handleStockItemsSearch = useMemo(
    () =>
      debounce((searchTerm) => {
        getStockItems({
          startIndex: 0,
          v: ResourceRepresentation.Default,
          limit: 10,
          q: searchTerm,
          totalCount: true,
          isDrug: null,
        } as any as StockItemFilter)
          .unwrap()
          .then((payload: any) => {
            if ((payload as any).error) {
              var errorMessage = toErrorMessage(payload);
              errorAlert(`Search failed ${errorMessage}`);
              return;
            } else {
              setStockItemSearchResult(payload?.results as StockItemDTO[]);
            }
          })
          .catch((error) => {
            var errorMessage = toErrorMessage(error);
            errorAlert(`Search failed ${errorMessage}`);
            return;
          });
      }, 300),
    [getStockItems]
  );

  const handleRefetchStockOperations = () => {
    refetchStockOperations();
  };
  return (
    <div className="stkpg-page">
      <div className="stkpg-page-header stkpg-opts-items-header">
        <div>
          <h1 className="stkpg-page-title">
            {t("stockmanagement.stockoperation.list.title")}
          </h1>
          <h3
            className={`stkpg-page-subtitle ${styles.bodyShort02} ${styles.marginTop} ${styles.whiteSpacePreWrap}`}
          >
            {t("stockmanagement.stockoperation.list.description")}
          </h3>
        </div>
        <div className="stock-item-filter">
          <ComboBox
            titleText="Stock Item"
            id="cbStockItem"
            items={stockItemSearchResult}
            onChange={onStockItemChanged}
            onInputChange={handleStockItemsSearch}
            itemToString={(item) =>
              item
                ? item?.display ??
                  (item?.drugName
                    ? `${item?.drugName}${
                        item?.commonName ?? item?.conceptName
                          ? ` (${item?.commonName ?? item?.conceptName})`
                          : ""
                      }`
                    : null) ??
                  item?.conceptName ??
                  ""
                : ""
            }
            placeholder={"Filter stock item..."}
          />
        </div>
      </div>
      <div className="stkpg-page-body">
        <main className={`${styles.listDetailsPage}`}>
          <section>
            <div className={styles.tableContainer}>
              <StockOperationListTable
                stockOperations={stockOperations ?? InitialResults}
                stockOperationTypes={filterOperationTypes}
                createOperationTypes={createOperationTypes}
                sourceTypes={sourceTypes?.answers}
                isLoading={isLoading}
                isFetching={isFetching}
                search={{
                  onSearch: handleSearch,
                  refetch: handleRefetchStockOperations,
                  currentOperationTypeUuid: operationTypeUuid,
                  currentLocationUuid: locationUuid,
                  currentStockItemUuid: stockItemUuid,
                  setStatus: setStatus,
                  setOperationTypeUuid: setOperationTypeUuid,
                  setLocationUuid: setLocationUuid,
                  setSourceTypeUuid: setSourceTypeUuid,
                  setStockItemUuid: setStockItemUuid,
                  setOperationDateMin: setOperationDateMin,
                  setOperationDateMax: setOperationDateMax,
                  setIsLocationOther: setIsLocationOther,
                }}
                createStockOperation={handleNew}
                editStockOperation={handleEdit}
                pagination={{
                  usePagination: true,
                  currentPage,
                  onChange: ({ page, pageSize }) => {
                    setPageCount(page);
                    setCurrentPageSize(pageSize);
                  },
                  pageSize: currentPageSize,
                  totalItems: stockOperations?.totalCount || 0,
                  pagesUnknown: true,
                  lastPage:
                    (stockOperations?.results?.length || 0) < currentPageSize ||
                    currentPage * currentPageSize ===
                      stockOperations?.totalCount,
                }}
              />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default StockOperationList;
