import { ArrowDownLeft16, ArrowLeft16, Edit16, TrashCan16 } from '@carbon/icons-react';
import {
  Button,
  DataTable,
  DataTableSkeleton,
  DenormalizedRow,
  Modal,
  Pagination,
  SearchProps,
  Table,
  TableBatchAction,
  TableBatchActions,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  TableSelectRow,
  TableToolbar,
  TableToolbarAction,
  TableToolbarContent,
  TableToolbarMenu,
  TableToolbarSearch,
} from 'carbon-components-react';
import debounce from 'lodash-es/debounce';
import React, { CSSProperties, useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from '../../root.module.scss';
import { useAppSelector } from '../app/hooks';
import { Splash } from '../components/spinner/Splash';
import { URL_USER_ROLE_SCOPE } from '../constants';
import { PageableResult } from '../core/api/types/PageableResult';
import { UserRoleScope } from '../core/api/types/identity/UserRoleScope';
import { useDeleteUserRoleScopesMutation } from '../core/api/userRoleScope';
import { TASK_STOCKMANAGEMENT_USERROLESCOPES_MUTATE } from '../core/privileges';
import { errorAlert, successAlert } from '../core/utils/alert';
import { formatDisplayDate } from '../core/utils/datetimeUtils';
import { ClickElement } from '../core/utils/elementUtil';
import { isDesktopLayout, useLayoutType } from '../core/utils/layoutUtils';
import { toErrorMessage } from '../core/utils/stringUtils';
import useTranslation from '../core/utils/translation';
import { useHasPreviledge } from '../stock-auth/AccessControl';
import { selectUserId } from '../stock-auth/authSlice';


interface UserRoleScopeTableProps {
  userRoleScopes: PageableResult<UserRoleScope>;
  style?: CSSProperties;
  autoFocus?: boolean;
  isLoading: boolean;
  isFetching?: boolean;
  search: {
    onSearch(searchTerm: string): any;
    refetch(): void;
    currentSearchTerm?: string;
    otherSearchProps?: SearchProps;
  };
  createUserRoleScope(): void;
  editUserRoleScope(uuid: string): void;
  pagination: {
    usePagination: boolean;
    currentPage: number;
    onChange(props: any): any;
    pageSize: number;
    totalItems: number;
    pagesUnknown?: boolean;
    lastPage?: boolean;
  };
}

const UserRoleScopeTable: React.FC<UserRoleScopeTableProps> = ({
  userRoleScopes,
  search,
  pagination,
  isLoading,
  autoFocus,
  isFetching,
  createUserRoleScope,
  editUserRoleScope
}) => {
  const { t } = useTranslation();
  const isDesktop = isDesktopLayout(useLayoutType());
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [selectedDelete, setSelectedDelete] = useState<string[] | null>(null);
  const [startedDeletingUserRoleScope, setStartedDeletingUserRoleScope] = useState(false);
  const [deleteUserRoleScope, { reset: resetDeleteUserRoleScopeHook }] = useDeleteUserRoleScopesMutation();
  const currentUserId = useAppSelector(selectUserId);
  const handlerUserNameClick = useCallback((event: React.MouseEvent<HTMLAnchorElement>, uuid: string) => {
    event.preventDefault();
    editUserRoleScope(uuid);
  }, [editUserRoleScope]);
  const [canCreateModifyUserRoleScopes] = useHasPreviledge([TASK_STOCKMANAGEMENT_USERROLESCOPES_MUTATE], false);

  const onViewItem = useCallback((itemId: string, event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    editUserRoleScope(itemId);
  }, [editUserRoleScope])

  const headers = [
    {
      key: 'user',
      header: t('stockmanagement.userrolescope.list.header.name'),
    },
    {
      key: 'roleName',
      header: t('stockmanagement.userrolescope.list.header.role'),
    },
    {
      key: 'locations',
      header: t('stockmanagement.userrolescope.list.header.location'),
    },
    {
      key: 'stockOperations',
      header: t('stockmanagement.userrolescope.list.header.stockoperations'),
    },
    {
      key: 'permanent',
      header: t('stockmanagement.userrolescope.list.header.permanent'),
    },
    {
      key: 'activeFrom',
      header: t('stockmanagement.userrolescope.list.header.activeFrom'),
    },
    {
      key: 'activeTo',
      header: t('stockmanagement.userrolescope.list.header.activeTo'),
    },
    {
      key: 'enabled',
      header: t('stockmanagement.userrolescope.list.header.enabled'),
    },
    {
      key: 'actions',
      header: "",
    }
  ];

  const rows: Array<any> = useMemo(() =>
    userRoleScopes?.results?.map((userRoleScope, index) => ({
      id: userRoleScope?.uuid,
      key: `key-${userRoleScope?.uuid}`,
      uuid: `${userRoleScope?.uuid}`,
      user: (currentUserId === userRoleScope.userUuid || !canCreateModifyUserRoleScopes) ? `${userRoleScope?.userFamilyName} ${userRoleScope.userGivenName}` : <Link to={URL_USER_ROLE_SCOPE(userRoleScope?.uuid)} onClick={(e) => handlerUserNameClick(e, userRoleScope?.uuid)}>{`${userRoleScope?.userFamilyName} ${userRoleScope.userGivenName}`}</Link>,
      roleName: userRoleScope?.role,
      locations: userRoleScope?.locations?.map((location, index) => {
        const key = `loc-${userRoleScope?.uuid}-${location.locationUuid}`;
        return <span key={key}>{location?.locationName}{location?.enableDescendants ? <ArrowDownLeft16 key={`${key}-${index}-0`} /> : <ArrowLeft16 key={`${key}-${index}-1`} />} </span>
        //return 
      }),
      stockOperations: userRoleScope?.operationTypes?.map((operation, index) => {
        return operation?.operationTypeName
      })?.join(", "),
      permanent: userRoleScope?.permanent ? t('stockmanagement.yes') : t('stockmanagement.no'),
      activeFrom: formatDisplayDate(userRoleScope?.activeFrom),
      activeTo: formatDisplayDate(userRoleScope?.activeTo),
      enabled: userRoleScope?.enabled ? t('stockmanagement.yes') : t('stockmanagement.no'),
      actions: (canCreateModifyUserRoleScopes && currentUserId !== userRoleScope.userUuid) ?
        <Button type="button" size="sm" className="submitButton clear-padding-margin" iconDescription={"View"} kind="ghost" renderIcon={Edit16} onClick={(e) => onViewItem(userRoleScope?.uuid, e)} /> :
        ""
    })),
    [userRoleScopes?.results, currentUserId, canCreateModifyUserRoleScopes, t, handlerUserNameClick, onViewItem],
  );

  const handleSearch = useMemo(() => debounce((searchTerm) => search.onSearch(searchTerm), 300), [search]);

  function deleteSelectedRows(event: React.MouseEvent<HTMLButtonElement>, selectedRows: readonly DenormalizedRow[]) {
    if (selectedRows?.length > 0) {
      setSelectedDelete(selectedRows.map(p => p.id))
      setOpenDeleteConfirm(true);
    }
  };

  function deleteUserRoleScopeOnCancel() {
    setSelectedDelete(null)
    setOpenDeleteConfirm(false);
  }

  function deleteUserRoleScopeOnContinue() {
    if (selectedDelete == null || selectedDelete.length === 0) {
      deleteUserRoleScopeOnCancel();
      return;
    }
    setOpenDeleteConfirm(false);
    setStartedDeletingUserRoleScope(true);
    resetDeleteUserRoleScopeHook();
    deleteUserRoleScope(selectedDelete).then(
      (payload: any) => {
        setStartedDeletingUserRoleScope(false);
        if ((payload as any).error) {
          var errorMessage = toErrorMessage(payload);
          errorAlert(`${t("stockmanagement.userrolescope.delete.failed")} ${errorMessage}`);
          return;
        }
        ClickElement('button.bx--batch-summary__cancel');
        setSelectedDelete(null);
        search.refetch();
        successAlert(t("stockmanagement.userrolescope.delete.success"));
      })
      .catch((error) => {
        setStartedDeletingUserRoleScope(false);
        var errorMessage = toErrorMessage(error);
        errorAlert(`${t("stockmanagement.userrolescope.delete.failed")} ${errorMessage}`);
        return;
      });
  }

  if (isLoading) {
    return <DataTableSkeleton className={styles.dataTableSkeleton} showHeader={false} rowCount={5} columnCount={5} zebra />;
  }

  return <>

    {openDeleteConfirm && <Modal
      primaryButtonText={t("stockmanagement.yes")}
      secondaryButtonText={t("stockmanagement.no")}
      modalHeading={t("stockmanagement.confirm")}
      danger={true}
      onRequestClose={deleteUserRoleScopeOnCancel}
      shouldSubmitOnEnter={false}
      onRequestSubmit={deleteUserRoleScopeOnContinue}
      onSecondarySubmit={deleteUserRoleScopeOnCancel}
      open={true}
      size="sm"
    >
      <p>{t("stockmanagement.userrolescope.delete.confirmText")}</p>
    </Modal>
    }
    {startedDeletingUserRoleScope && <Splash active />}
    <div className={styles.tableOverride}>
      <DataTable rows={rows} headers={headers} isSortable={true} useZebraStyles={true}
        render={({ rows, headers, getHeaderProps, getTableProps, getRowProps, getSelectionProps, getBatchActionProps, selectedRows }) => (
          <TableContainer>
            <TableToolbar>
              <TableBatchActions {...getBatchActionProps()}>
                {canCreateModifyUserRoleScopes && <TableBatchAction
                  renderIcon={TrashCan16}
                  iconDescription={t('stockmanagement.userrolescope.list.deleteselectedrows')}
                  onClick={(e) => deleteSelectedRows(e, selectedRows)}
                >
                  {t('stockmanagement.delete')}
                </TableBatchAction>
                }
              </TableBatchActions>
              <TableToolbarContent>
                <TableToolbarSearch expanded={true} onChange={(evnt) => handleSearch(evnt.target.value)} persistent={true} />
                <TableToolbarMenu>
                  <TableToolbarAction onClick={() => search.refetch()}>
                    Refresh
                  </TableToolbarAction>
                </TableToolbarMenu>
                {canCreateModifyUserRoleScopes && <Button onClick={createUserRoleScope} size="sm" kind="primary">
                  {t('stockmanagement.addnew')}
                </Button>
                }
              </TableToolbarContent>
            </TableToolbar>
            <Table {...getTableProps()}>
              <TableHead>
                <TableRow>
                  {canCreateModifyUserRoleScopes && <TableHeader className='checkbox-column' />}
                  {headers.map((header: any, index) => (
                    <TableHeader
                      {...getHeaderProps({
                        header,
                        isSortable: header.isSortable,
                      })}
                      className={isDesktop ? styles.desktopHeader : styles.tabletHeader}
                      key={`${header.key}`}>
                      {header.header?.content ?? header.header}
                    </TableHeader>
                  ))}
                  {canCreateModifyUserRoleScopes &&
                    <TableHeader></TableHeader>
                  }
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row: any, rowIndex) => {
                  return (
                    <TableRow
                      className={isDesktop ? styles.desktopRow : styles.tabletRow}
                      key={row.id}>
                      {canCreateModifyUserRoleScopes && <TableSelectRow className='checkbox-column' key={`tsr${row.id}`} {...getSelectionProps({ row })} />}
                      {row.cells.map((cell: any, index: any) => (
                        <TableCell key={cell.id}>{cell.value}</TableCell>
                      ))}
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      >
      </DataTable>
      {pagination.usePagination && (
        <Pagination
          page={pagination.currentPage}
          pageSize={pagination.pageSize}
          pageSizes={[10, 20, 30, 40, 50]}
          totalItems={pagination.totalItems}
          onChange={pagination.onChange}
          className={styles.paginationOverride}
          pagesUnknown={pagination?.pagesUnknown}
          isLastPage={pagination.lastPage}

        />
      )}
    </div>
  </>;
};

export default UserRoleScopeTable;
