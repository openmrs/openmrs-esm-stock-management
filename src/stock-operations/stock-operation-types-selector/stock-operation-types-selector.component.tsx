import React from "react";
import { ButtonSkeleton, OverflowMenu, OverflowMenuItem } from "@carbon/react";
import { OverflowMenuVertical } from "@carbon/react/icons";
import { useStockOperationTypes } from "../../stock-lookups/stock-lookups.resource";
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

  if (isLoading || isError) return <ButtonSkeleton />;

  onOperationLoaded(createOperationTypes);

  return (
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
      {createOperationTypes
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((operation) => {
          return (
            <OverflowMenuItem
              key={operation.uuid}
              itemText={operation.name}
              onClick={() => {
                onOperationTypeSelected?.(operation);
              }}
            />
          );
        })}
    </OverflowMenu>
  );
};

export default StockOperationTypesSelector;
