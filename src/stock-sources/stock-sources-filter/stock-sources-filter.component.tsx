import React from 'react';
import { Dropdown, DropdownSkeleton } from '@carbon/react';
import { showSnackbar, useConfig } from '@openmrs/esm-framework';
import { type ConfigObject } from '../../config-schema';
import { useConcept } from '../../stock-lookups/stock-lookups.resource';
import styles from './stock-sources-filter.scss';

const StockSourcesFilter: React.FC<{
  onFilterChange: (selectedSourceType: string) => void;
}> = ({ onFilterChange }) => {
  const { stockSourceTypeUUID } = useConfig<ConfigObject>();

  const { items, isLoading, error } = useConcept(stockSourceTypeUUID);

  if (isLoading) {
    return <DropdownSkeleton size="sm" />;
  }

  if (error) {
    showSnackbar({
      title: 'Error fetching stock sources',
      kind: 'error',
      isLowContrast: true,
    });
  }

  if (!items) {
    return null;
  }

  return (
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
  );
};

export default StockSourcesFilter;
