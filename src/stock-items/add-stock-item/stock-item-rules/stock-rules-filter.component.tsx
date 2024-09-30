import styles from './stock-rules-filter.scss';
import { Dropdown, DropdownSkeleton } from '@carbon/react';
import React from 'react';
import { useStockRules } from './stock-rules.resource';
import { ResourceRepresentation } from '../../../core/api/api';

interface StockRulesFilterProps {
  stockItemUuid: string;
}

const StockRulesFilter: React.FC<StockRulesFilterProps> = ({ stockItemUuid }) => {
  const { items, isLoading, error } = useStockRules({
    v: ResourceRepresentation.Default,
    totalCount: true,
    stockItemUuid: stockItemUuid,
  });

  if (isLoading || error) {
    return <DropdownSkeleton />;
  }
  return (
    <>
      <div className={styles.filterContainer}>
        <Dropdown
          id="stockRulesFiter"
          items={[...items.results]}
          itemToString={(item) => (item ? item.display : 'Not Set')}
          type="inline"
          size="sm"
        />
      </div>
    </>
  );
};

export default StockRulesFilter;
