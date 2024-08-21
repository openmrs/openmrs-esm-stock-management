import React, { useEffect, useMemo } from "react";
import { ButtonSkeleton, OverflowMenu, OverflowMenuItem } from "@carbon/react";
import { OverflowMenuVertical } from "@carbon/react/icons";
import {
  useStockOperationTypes,
  useUserRoles,
} from "../../stock-lookups/stock-lookups.resource";
import { StockOperationType } from "../../core/api/types/stockOperation/StockOperationType";

interface StockOperationTypesSelectorProps {
  onOperationTypeSelected?: (operation: StockOperationType) => void;
  onOperationLoaded?: (operation: StockOperationType[]) => void;
}

const StockOperationTypesSelector: React.FC<
  StockOperationTypesSelectorProps
> = ({ onOperationTypeSelected, onOperationLoaded }) => {
  const {
    types: { results: createOperationTypes },
    isLoading,
    isError,
  } = useStockOperationTypes();
  const { userRoles } = useUserRoles();

  const filterOperationTypes = useMemo(() => {
    const applicablePrivilegeScopes =
      userRoles?.operationTypes?.map((p) => p.operationTypeUuid) || [];
    const uniqueApplicablePrivilegeScopes = [
      ...new Set(applicablePrivilegeScopes),
    ];

    return (
      createOperationTypes?.filter((p) =>
        uniqueApplicablePrivilegeScopes.includes(p.uuid)
      ) || []
    );
  }, [createOperationTypes, userRoles]);

  useEffect(() => {
    onOperationLoaded?.(filterOperationTypes);
  }, [filterOperationTypes, onOperationLoaded]);

  if (isLoading || isError) return <ButtonSkeleton />;

  return filterOperationTypes && filterOperationTypes.length ? (
    <OverflowMenu
      renderIcon={() => (
        <>
          Start New&nbsp;&nbsp;
          <OverflowMenuVertical size={16} />
        </>
      )}
      menuOffset={{ right: "-100px" }}
      style={{
        backgroundColor: "#007d79",
        backgroundImage: "none",
        color: "#fff",
        minHeight: "1rem",
        padding: ".95rem !important",
        width: "8rem",
        marginRight: "0.5rem",
        whiteSpace: "nowrap",
      }}
    >
      {filterOperationTypes
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((operation) => (
          <OverflowMenuItem
            key={operation.uuid}
            itemText={operation.name}
            onClick={() => {
              onOperationTypeSelected?.(operation);
            }}
          />
        ))}
    </OverflowMenu>
  ) : null;
};

export default StockOperationTypesSelector;
