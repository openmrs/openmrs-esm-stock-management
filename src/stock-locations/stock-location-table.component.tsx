import { Edit16, TrashCan16 } from "@carbon/icons-react";
import {
  Button,
  DataTable,
  DataTableSkeleton,
  Modal,
  Pagination,
  Select,
  SelectItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  TableToolbar,
  TableToolbarAction,
  TableToolbarContent,
  TableToolbarMenu,
  TableToolbarSearch,
} from "@carbon/react";
import debounce from "lodash-es/debounce";
import React, {
  CSSProperties,
  ChangeEvent,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link } from "react-router-dom";
import styles from "../../root.module.scss";
import { Splash } from "../components/spinner/Splash";
import {
  URL_LOCATIONS,
  URL_LOCATIONS_EDIT,
  URL_LOCATIONS_NEW,
} from "../constants";
import {
  useDeleteLocationMutation,
  useLazyGetLocationWithIdByUuidQuery,
} from "../core/api/lookups";
import {
  OpenMRSLocation,
  OpenMRSLocationTag,
} from "../core/api/types/Location";
import { PageableResult } from "../core/api/types/PageableResult";
import { MANAGE_LOCATIONS } from "../core/openmrsPriviledges";
import { displayErrors, errorAlert, successAlert } from "../core/utils/alert";
import { ClickElement } from "../core/utils/elementUtil";
import { isDesktopLayout, useLayoutType } from "../core/utils/layoutUtils";
import { toErrorMessage } from "../core/utils/stringUtils";
import useTranslation from "../core/utils/translation";
import { useHasPreviledge } from "../stock-auth/AccessControl";

interface LocationTableProps {
  locations: PageableResult<OpenMRSLocation>;
  locationTags?: PageableResult<OpenMRSLocationTag>;
  style?: CSSProperties;
  autoFocus?: boolean;
  isLoading: boolean;
  isFetching?: boolean;
  search: {
    onSearch(searchTerm: string): any;
    refetch(): void;
    currentSearchTerm?: string | null;
    // otherSearchProps?: SearchProps;
  };
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

const LocationTable: React.FC<LocationTableProps> = ({
  locations,
  locationTags,
  search,
  isLoading,
  autoFocus,
  isFetching,
  pagination,
}) => {
  const { t } = useTranslation();
  const isDesktop = isDesktopLayout(useLayoutType());
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [selectedDelete, setSelectedDelete] = useState<OpenMRSLocation | null>(
    null
  );
  const [startedDeletingLocation, setStartedDeletingLocation] = useState(false);
  const [locationTag, setLocationTag] = useState<String>();
  const [deleteLocation, { reset: resetDeleteLocationHook }] =
    useDeleteLocationMutation();
  const [canCreateLocation] = useHasPreviledge([MANAGE_LOCATIONS], false);
  const [getLocationWithIdByUuid, { isFetching: isFetchingLocationWithId }] =
    useLazyGetLocationWithIdByUuidQuery();
  const componentMounted = useRef(false);

  React.useEffect(() => {
    componentMounted.current = true;
    return () => {
      componentMounted.current = false;
    };
  }, []);

  const headers = [
    {
      key: "name",
      header: t("stockmanagement.location.list.header.name"),
    },
    {
      key: "tags",
      header: t("stockmanagement.location.list.header.tags"),
    },
    {
      key: "childLocations",
      header: t("stockmanagement.location.list.header.childlocations"),
    },
    {
      key: "actions",
      header: "",
    },
  ];

  const handleSearch = useMemo(
    () => debounce((searchTerm) => search.onSearch(searchTerm), 300),
    [search]
  );

  const onDeleteLocationClick = useCallback(
    (uuid: string) => {
      if (uuid) {
        let record = locations?.results?.find((p) => p.uuid === uuid);
        if (record) {
          setSelectedDelete(record);
          setOpenDeleteConfirm(true);
        }
      }
    },
    [locations?.results]
  );

  const deleteLocationOnCancel = () => {
    setSelectedDelete(null);
    setOpenDeleteConfirm(false);
  };

  const deleteLocationOnContinue = () => {
    if (selectedDelete == null) {
      deleteLocationOnCancel();
      return;
    }
    setOpenDeleteConfirm(false);
    setStartedDeletingLocation(true);
    resetDeleteLocationHook();
    deleteLocation(selectedDelete.uuid)
      .then((payload: any) => {
        setStartedDeletingLocation(false);
        if ((payload as any).error) {
          var errorMessage = toErrorMessage(payload);
          errorAlert(
            `${t("stockmanagement.location.delete.failed")} ${errorMessage}`
          );
          return;
        }
        ClickElement("button.bx--batch-summary__cancel");
        setSelectedDelete(null);
        search.refetch();
        successAlert(t("stockmanagement.location.delete.success"));
      })
      .catch((error) => {
        setStartedDeletingLocation(false);
        var errorMessage = toErrorMessage(error);
        errorAlert(
          `${t("stockmanagement.location.delete.failed")} ${errorMessage}`
        );
        return;
      });
  };

  const onLocationTagChange = (evt: ChangeEvent<HTMLSelectElement>) => {
    setLocationTag(evt.target.value);
  };

  const createLocation = () => {
    window.open(URL_LOCATIONS_NEW(), "_blank");
  };

  const onViewItem = useCallback(
    async (uuid: string, event: React.MouseEvent<HTMLButtonElement>) => {
      if (event) {
        event.preventDefault();
      }
      await getLocationWithIdByUuid(uuid)
        .then((payload: any) => {
          if ((payload as any).error) {
            displayErrors(payload);
            return;
          }
          let locationWithId = payload?.data as OpenMRSLocation;
          if (componentMounted.current) {
            window.open(URL_LOCATIONS_EDIT(locationWithId?.id), "_blank");
          }
        })
        .catch((error: any) => displayErrors(error));
    },
    [getLocationWithIdByUuid]
  );

  const onViewItemClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>, uuid: string) => {
      event.preventDefault();
      onViewItem(uuid, null!);
    },
    [onViewItem]
  );

  const rows: Array<any> = useMemo(
    () =>
      locations?.results
        ?.filter((p) => {
          if (locationTag) {
            return p.tags?.some((x) => x.uuid === locationTag) ?? false;
          } else {
            return true;
          }
        })
        ?.map((location, index) => ({
          id: location?.uuid,
          key: `key-${location?.uuid}`,
          uuid: `${location?.uuid}`,
          name: (
            <Link
              to={URL_LOCATIONS}
              onClick={(e) => onViewItemClick(e, location.uuid)}
            >{`${location?.name}`}</Link>
          ),
          tags: location?.tags?.map((p) => p.display)?.join(", ") ?? "",
          childLocations:
            location?.childLocations?.map((p) => p.display)?.join(", ") ?? "",
          actions: canCreateLocation ? (
            <div
              key={`${location?.uuid}-actions`}
              style={{ display: "inline-block", whiteSpace: "nowrap" }}
            >
              <Button
                key={`${location?.uuid}-actions-edit`}
                type="button"
                size="sm"
                className="submitButton clear-padding-margin"
                iconDescription={"Edit"}
                kind="ghost"
                renderIcon={Edit16}
                onClick={(e) => onViewItem(location.uuid, e)}
              />
              {(location?.childLocations?.length ?? 0) === 0 && (
                <Button
                  key={`${location?.uuid}-actions-delete`}
                  type="button"
                  size="sm"
                  className="submitButton clear-padding-margin"
                  iconDescription={"Delete"}
                  kind="ghost"
                  renderIcon={TrashCan16}
                  onClick={(e) => onDeleteLocationClick(location.uuid)}
                />
              )}
            </div>
          ) : (
            ""
          ),
        })),
    [
      locations?.results,
      locationTag,
      canCreateLocation,
      onViewItemClick,
      onViewItem,
      onDeleteLocationClick,
    ]
  );

  if (isLoading) {
    return (
      <DataTableSkeleton
        className={styles.dataTableSkeleton}
        showHeader={false}
        rowCount={5}
        columnCount={5}
        zebra
      />
    );
  }

  return (
    <>
      {openDeleteConfirm && (
        <Modal
          primaryButtonText={t("stockmanagement.yes")}
          secondaryButtonText={t("stockmanagement.no")}
          modalHeading={t("stockmanagement.confirm")}
          danger={true}
          onRequestClose={deleteLocationOnCancel}
          shouldSubmitOnEnter={false}
          onRequestSubmit={deleteLocationOnContinue}
          onSecondarySubmit={deleteLocationOnCancel}
          open={true}
          size="sm"
        >
          <p>
            {t("stockmanagement.location.delete.confirmText")}&nbsp;
            <b>{selectedDelete?.name}</b>?
          </p>
        </Modal>
      )}
      {(startedDeletingLocation || isFetchingLocationWithId) && (
        <Splash active blockUi />
      )}
      <div className={styles.tableOverride}>
        <DataTable
          rows={rows}
          headers={headers}
          isSortable={true}
          useZebraStyles={true}
          render={({
            rows,
            headers,
            getHeaderProps,
            getTableProps,
            getRowProps,
            getSelectionProps,
            getBatchActionProps,
            selectedRows,
          }) => (
            <TableContainer>
              <TableToolbar>
                <TableToolbarContent>
                  <TableToolbarSearch
                    expanded={true}
                    onChange={(evnt) => handleSearch(evnt.target.value)}
                    persistent={true}
                  />
                  <Select
                    className="stkpg-datable-select"
                    inline
                    id="locationTag"
                    labelText=""
                    onChange={onLocationTagChange}
                  >
                    <SelectItem text="All" value={""} />
                    {locationTags?.results?.map((tag) => {
                      return (
                        <SelectItem
                          key={tag.uuid}
                          value={tag.uuid}
                          text={tag.display}
                        />
                      );
                    })}
                  </Select>
                  <TableToolbarMenu>
                    <TableToolbarAction onClick={() => search.refetch()}>
                      Refresh
                    </TableToolbarAction>
                  </TableToolbarMenu>
                  {canCreateLocation && (
                    <Button onClick={createLocation} size="sm" kind="primary">
                      {t("stockmanagement.addnew")}
                    </Button>
                  )}
                </TableToolbarContent>
              </TableToolbar>
              <Table {...getTableProps()}>
                <TableHead>
                  <TableRow>
                    {headers.map((header: any, index) => (
                      <TableHeader
                        {...getHeaderProps({
                          header,
                          isSortable: header.isSortable,
                        })}
                        className={
                          isDesktop ? styles.desktopHeader : styles.tabletHeader
                        }
                        key={`${header.key}`}
                      >
                        {header.header?.content ?? header.header}
                      </TableHeader>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row: any, rowIndex) => {
                    return (
                      <TableRow
                        className={
                          isDesktop ? styles.desktopRow : styles.tabletRow
                        }
                        key={row.id}
                      >
                        {row.cells.map((cell: any, index: any) => (
                          <TableCell key={cell.id}>{cell.value}</TableCell>
                        ))}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        ></DataTable>
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
    </>
  );
};

export default LocationTable;
