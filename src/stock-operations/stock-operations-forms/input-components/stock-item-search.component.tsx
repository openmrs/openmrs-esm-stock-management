import { ClickableTile, Search } from '@carbon/react';
import { useDebounce } from '@openmrs/esm-framework';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StockItemDTO } from '../../../core/api/types/stockItem/StockItem';
import { useFilterableStockItems } from '../hooks/useFilterableStockItems';
import styles from './input-components-styles.scss';

type StockItemSearchProps = {
  onSelectedItem?: (stockItem: StockItemDTO) => void;
};

const StockItemSearch: React.FC<StockItemSearchProps> = ({ onSelectedItem }) => {
  const { t } = useTranslation();
  const { isLoading, stockItemsList, setSearchString } = useFilterableStockItems({});
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm);

  useEffect(() => {
    if (debouncedSearchTerm?.length !== 0) {
      setSearchString(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, setSearchString]);

  const handleOnSearchResultClick = (stockItem: StockItemDTO) => {
    onSelectedItem?.(stockItem);
    setSearchTerm('');
  };
  return (
    <div className={styles.stockItemSearchContainer}>
      <div style={{ display: 'flex' }}>
        <Search
          size="lg"
          placeholder={t('findItems', 'Find your items')}
          labelText={t('search', 'Search')}
          closeButtonLabelText={t('clearSearch', 'Clear search input')}
          value={searchTerm}
          id="search-stock-operation-item"
          name="search-stock-operation-item"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      {searchTerm && stockItemsList?.length > 0 && (
        <div className={styles.searchResults}>
          {stockItemsList?.slice(0, 5).map((stockItem) => (
            <ClickableTile onClick={() => handleOnSearchResultClick(stockItem)} key={stockItem?.uuid}>
              {stockItem?.commonName}
            </ClickableTile>
          ))}
        </div>
      )}
    </div>
  );
};

export default StockItemSearch;
