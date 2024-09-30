import styles from './stock-operation-statuses-filter.scss';
import { Dropdown } from '@carbon/react';
import React from 'react';
const StockOperationStatusesFilter: React.FC = () => {
  // get stock sources

  const items = ['SUBMITTED', 'NEW', 'RETURNED', 'CANCELLED', 'DISPATCHED', 'COMPLETED', 'REJECTED'];

  return (
    <>
      <div className={styles.filterContainer}>
        <Dropdown
          id="stockOperationStatusesFiter"
          items={items}
          itemToString={(item) => (item ? item : 'Not Set')}
          type="inline"
          size="sm"
        />
      </div>
    </>
  );
};

export default StockOperationStatusesFilter;
