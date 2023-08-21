import React, { useMemo } from "react";
import { Button, DataTableSkeleton, Link, Tile } from "@carbon/react";
import { Add } from "@carbon/react/icons";
import styles from "./stock-user-role-scopes.scss";
import { ResourceRepresentation } from "../core/api/api";
import useStockUserRoleScopesPage from "./stock-user-role-scopes-items-table.resource";
import DataList from "../core/components/table/table.component";
import { URL_USER_ROLE_SCOPE } from "../stock-items/stock-items-table.component";
import { useTranslation } from "react-i18next";

function StockUserRoleScopesItems() {
  const { t } = useTranslation();
  // get sources
  const { isLoading, tableHeaders, items } = useStockUserRoleScopesPage({
    v: ResourceRepresentation.Full,
  });

  const tableRows = useMemo(() => {
    return items?.map((userRoleScope) => {
      return {
        ...userRoleScope,
        id: userRoleScope?.uuid,
        key: `key-${userRoleScope?.uuid}`,
        uuid: `${userRoleScope?.uuid}`,
        user: (
          <Link
            to={URL_USER_ROLE_SCOPE(userRoleScope?.uuid)}
          >{`${userRoleScope?.userFamilyName} ${userRoleScope.userGivenName}`}</Link>
        ),
        roleName: userRoleScope?.role,
        locations: userRoleScope?.locations?.map((location) => {
          const key = `loc-${userRoleScope?.uuid}-${location.locationUuid}`;
          return <span key={key}>{location?.locationName}</span>;
          //return
        }),
        stockOperations: userRoleScope?.operationTypes
          ?.map((operation) => {
            return operation?.operationTypeName;
          })
          ?.join(", "),
        permanent: userRoleScope?.permanent
          ? t("stockmanagement.yes", "Yes")
          : t("stockmanagement.no", "No"),
        // activeFrom: formatDisplayDate(userRoleScope?.activeFrom),
        // activeTo: formatDisplayDate(userRoleScope?.activeTo),
        enabled: userRoleScope?.enabled
          ? t("stockmanagement.yes", "Yes")
          : t("stockmanagement.no", "No"),
        // actions: (
        //   <Button
        //     type="button"
        //     size="sm"
        //     className="submitButton clear-padding-margin"
        //     iconDescription={"View"}
        //     kind="ghost"
        //     renderIcon={Edit16}
        //     onClick={(e) => onViewItem(userRoleScope?.uuid, e)}
        //   />
        // ),
      };
    });
  }, [items]);

  if (isLoading) {
    return <DataTableSkeleton role="progressbar" />;
  }

  if (items?.length) {
    return <DataList columns={tableHeaders} data={tableRows} />;
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
