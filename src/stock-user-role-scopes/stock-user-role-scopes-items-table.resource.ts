import { StockOperationFilter } from "../stock-operations/stock-operations.resource";
import { useUserRoleScopes } from "./stock-user-role-scopes.resource";
import { useMemo, useState } from "react";
import { usePagination } from "@openmrs/esm-framework";

export default function useStockUserRoleScopesPage(
  filter: StockOperationFilter
) {
  const { items, isLoading, isError } = useUserRoleScopes(filter);

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
        header: "User",
        key: "user",
      },

      {
        id: 1,
        header: "Role",
        key: "role",
      },
      {
        id: 2,
        header: "Location(s)",
        key: "location",
      },
      {
        id: 3,
        header: "Stock Operations",
        key: "stockOperations",
      },
      {
        id: 4,
        header: "Permanent ?",
        key: "permanent",
      },
      {
        id: 5,
        header: "Active From ",
        key: "from",
      },
      {
        id: 6,
        header: "Active To",
        key: "permanent",
      },
      {
        id: 7,
        header: "Enabled ?",
        key: "enabled",
      },
    ],
    []
  );

  return {
    items: items.results,
    currentPage,
    currentPageSize,
    paginatedItems,
    goTo,
    pageSizes,
    isLoading,
    isError,
    setPageSize,
    tableHeaders,
  };
}
