import styles from './stock-operation-operations-filter.scss';
import { Dropdown, DropdownSkeleton } from '@carbon/react';
import React from 'react';
import { useStockOperationTypes } from '../../stock-lookups/stock-lookups.resource';

const StockOperationOperationsFilter: React.FC = () => {
  // get stock sources
  const { stockOperationTypes, isLoading, error } = useStockOperationTypes();
  if (isLoading || error) {
    return <DropdownSkeleton />;
  }
  return (
    <>
      <div className={styles.filterContainer}>
        <Dropdown
          id="stockOperationOperationsFiter"
          items={stockOperationTypes}
          itemToString={(item) => (item ? item.name : 'Not Set')}
          type="inline"
          size="sm"
        />
      </div>
    </>
  );
};

export default StockOperationOperationsFilter;
