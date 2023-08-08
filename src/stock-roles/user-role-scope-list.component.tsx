import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../root.module.scss";
import { Splash } from "../components/spinner/Splash";
import {
  URL_STOCK_HOME,
  URL_USER_ROLE_SCOPE,
  URL_USER_ROLE_SCOPES,
  URL_USER_ROLE_SCOPES_NEW,
} from "../constants";
import { PageableResult } from "../core/api/types/PageableResult";
import { UserRoleScope } from "../core/api/types/identity/UserRoleScope";
import {
  UserRoleScopeFilter,
  useGetUserRoleScopesQuery,
  useLazyGetUserRoleScopeQuery,
} from "../core/api/userRoleScope";
import { errorAlert } from "../core/utils/alert";
import { BreadCrumbs } from "../core/utils/breadCrumbs";
import { isDesktopLayout, useLayoutType } from "../core/utils/layoutUtils";
import { toErrorMessage } from "../core/utils/stringUtils";
import useTranslation from "../core/utils/translation";
import { ModalPopup } from "./modal-popup.component";
import UserRoleScopeListTable from "./user-role-scope-table.component";

const InitialResults: PageableResult<UserRoleScope> = {
  results: [],
  totalCount: 0,
  links: null,
};

const UserRoleScopeList = () => {
  const { t } = useTranslation();
  let navigate = useNavigate();
  const isDesktop = isDesktopLayout(useLayoutType());
  useEffect(() => {
    new BreadCrumbs()
      .withHome()
      .withLabel(t("stockmanagement.dashboard.title"), URL_STOCK_HOME)
      .withLabel(
        t("stockmanagement.userrolescope.list.title"),
        URL_USER_ROLE_SCOPES
      )
      .generateBreadcrumbHtml();
  }, [t]);
  const [editableModel, setEditableMode] = useState<UserRoleScope | null>(null);
  const [openModal, setOpenModal] = useState(false);

  const [userRoleScopeFilter, setUserRoleScopeFilter] =
    useState<UserRoleScopeFilter>({
      startIndex: 0,
      v: null,
      limit: 10,
      q: null,
      totalCount: true,
    });
  const [currentPage, setPageCount] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(10);
  const [searchString, setSearchString] = useState(null);
  useEffect(() => {
    setUserRoleScopeFilter({
      startIndex: currentPage - 1,
      v: null,
      limit: currentPageSize,
      q: searchString,
      totalCount: true,
    });
  }, [searchString, currentPage, currentPageSize]);
  const {
    data: userRoleScopes,
    isFetching,
    isLoading,
    refetch: refetchUserRoleScopes,
  } = useGetUserRoleScopesQuery(userRoleScopeFilter, {
    refetchOnMountOrArgChange: true,
  });
  const [fetchUserRoleScope, { isFetching: isFetchingUserRoleScope }] =
    useLazyGetUserRoleScopeQuery();

  const handleSearch = useCallback((str) => {
    setPageCount(1);
    setSearchString(str);
  }, []);

  const handleNew = useCallback(() => {
    if (isDesktop) {
      setEditableMode({
        permanent: true,
        enabled: true,
        locations: [],
        operationTypes: [],
      } as unknown as UserRoleScope);
      setOpenModal(true);
    } else {
      navigate(URL_USER_ROLE_SCOPES_NEW);
    }
  }, [isDesktop, navigate]);

  const handleEdit = (uuid: string) => {
    if (isDesktop) {
      fetchUserRoleScope(uuid)
        .unwrap()
        .then((payload: any) => {
          if ((payload as any).error) {
            var errorMessage = toErrorMessage(payload);
            errorAlert(
              `${t(
                "stockmanagement.userrolescope.load.failed"
              )} ${errorMessage}`
            );
            return;
          } else if (payload?.uuid === uuid) {
            setEditableMode(payload as UserRoleScope);
            setOpenModal(true);
          }
        })
        .catch((error: any) => {
          var errorMessage = toErrorMessage(error);
          errorAlert(
            `${t("stockmanagement.userrolescope.load.failed")} ${errorMessage}`
          );
          return;
        });
    } else {
      navigate(URL_USER_ROLE_SCOPE(uuid));
    }
  };

  const handleRefetchUserRoleScopes = () => {
    refetchUserRoleScopes();
  };

  const handleUserRoleScopeModalClose = () => {
    setOpenModal(false);
    setEditableMode(null);
  };

  return (
    <div className="stkpg-page">
      <div className="stkpg-page-header">
        <h1 className="stkpg-page-title">
          {t("stockmanagement.userrolescope.list.title")}
        </h1>
        <h3
          className={`stkpg-page-subtitle ${styles.bodyShort02} ${styles.marginTop} ${styles.whiteSpacePreWrap}`}
        >
          {t("stockmanagement.userrolescope.list.description")}
        </h3>
      </div>
      <div className="stkpg-page-body">
        <main className={`${styles.listDetailsPage}`}>
          <section>
            <div className={styles.tableContainer}>
              <UserRoleScopeListTable
                userRoleScopes={userRoleScopes ?? InitialResults}
                isLoading={isLoading}
                isFetching={isFetching}
                search={{
                  onSearch: handleSearch,
                  refetch: handleRefetchUserRoleScopes,
                }}
                createUserRoleScope={handleNew}
                editUserRoleScope={handleEdit}
                pagination={{
                  usePagination: true,
                  currentPage,
                  onChange: ({ page, pageSize }) => {
                    setPageCount(page);
                    setCurrentPageSize(pageSize);
                  },
                  pageSize: currentPageSize,
                  totalItems: userRoleScopes?.totalCount || 0,
                  pagesUnknown: false,
                  lastPage:
                    (userRoleScopes?.results?.length || 0) < currentPageSize ||
                    currentPage * currentPageSize ===
                      userRoleScopes?.totalCount,
                }}
              />
            </div>
          </section>
          {isFetchingUserRoleScope && <Splash active={true} />}
          {openModal && !isFetchingUserRoleScope && editableModel && (
            <ModalPopup
              onClose={handleUserRoleScopeModalClose}
              model={editableModel}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default UserRoleScopeList;
