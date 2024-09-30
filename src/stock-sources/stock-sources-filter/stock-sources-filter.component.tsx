import styles from './stock-sources-filter.scss';
import { Dropdown, DropdownSkeleton } from '@carbon/react';
import React from 'react';
import { useConcept } from '../../stock-lookups/stock-lookups.resource';
import { type ConfigObject } from '../../config-schema';
import { useConfig } from '@openmrs/esm-framework';

const StockSourcesFilter: React.FC<{
  onFilterChange: (selectedSourceType: string) => void;
}> = ({ onFilterChange }) => {
  const { stockSourceTypeUUID } = useConfig<ConfigObject>();
  // get stock sources
  const { items, isLoading, error } = useConcept(stockSourceTypeUUID);
  if (isLoading || error) {
    return <DropdownSkeleton />;
  }
  return (
    <>
      <div className={styles.filterContainer}>
        <Dropdown
          id="stockSourcesFiter"
          items={[...items.answers]}
          initialSelectedItem={items.answers[0]}
          itemToString={(item) => (item ? item.display : 'Not Set')}
          titleText="Filter: "
          type="inline"
          size="sm"
          onChange={({ selectedItem }) => onFilterChange(selectedItem?.display)}
        />
      </div>
    </>
  );
};

export default StockSourcesFilter;
