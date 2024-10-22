import React, { useEffect, useMemo } from 'react';
import { ButtonSkeleton, OverflowMenu, OverflowMenuItem } from '@carbon/react';
import { OverflowMenuVertical } from '@carbon/react/icons';
import { StockOperationType } from '../../core/api/types/stockOperation/StockOperationType';
import { useAvailableOperationTypes } from './useAvailableOperationTypes';

interface StockOperationTypesSelectorProps {
  onOperationTypeSelected?: (selectedOperation: StockOperationType) => void;
  onOperationsLoaded?: (availableOperations: StockOperationType[]) => void;
}

const StockOperationTypesSelector: React.FC<StockOperationTypesSelectorProps> = ({
  onOperationTypeSelected,
  onOperationsLoaded,
}) => {
  const { availableOperationTypes, isLoading, error } = useAvailableOperationTypes();

  useEffect(() => {
    onOperationsLoaded?.(availableOperationTypes);
  }, [availableOperationTypes, onOperationsLoaded]);

  if (isLoading || error) return <ButtonSkeleton />;

  if (!availableOperationTypes.length) return null;

  return (
    <OverflowMenu
      renderIcon={() => (
        <>
          Start New&nbsp;&nbsp;
          <OverflowMenuVertical size={16} />
        </>
      )}
      menuOffset={{ right: '-100px' }}
      style={menuStyle}
    >
      {availableOperationTypes
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((operation) => (
          <OverflowMenuItem
            key={operation.uuid}
            itemText={operation.name}
            onClick={() => onOperationTypeSelected?.(operation)}
          />
        ))}
    </OverflowMenu>
  );
};

const menuStyle = {
  backgroundColor: '#007d79',
  backgroundImage: 'none',
  color: '#fff',
  minHeight: '1rem',
  padding: '.95rem !important',
  width: '8rem',
  marginRight: '0.5rem',
  whiteSpace: 'nowrap',
} as const;

export default StockOperationTypesSelector;
