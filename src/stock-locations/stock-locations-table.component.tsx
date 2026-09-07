import React, { useEffect, useRef } from 'react';
import {
  Button,
  DataTableSkeleton,
  TableToolbarAction,
  TableToolbarMenu,
  TableToolbarSearch,
  Tile,
} from '@carbon/react';
import { Add } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';
import { showModal } from '@openmrs/esm-framework';
import { ResourceRepresentation } from '../core/api/api';
import { useStockLocationPages } from './stock-locations-table.resource';
import DataList from '../core/components/table/table.component';
import styles from '../stock-items/stock-items-table.scss';

interface StockLocationsTableProps {
  status?: string;
}

const StockLocationsItems: React.FC<StockLocationsTableProps> = () => {
  const { t } = useTranslation();
  const disposeModal = useRef<ReturnType<typeof showModal>>();
  useEffect(() => () => disposeModal.current?.(), []);

  const { tableHeaders, tableRows, items, isLoading, mutate } = useStockLocationPages({
    v: ResourceRepresentation.Full,
  });

  const handleRefresh = () => {
    mutate();
  };

  if (isLoading) {
    return <DataTableSkeleton role="progressbar" />;
  }

  if (items?.length) {
    return (
      <DataList columns={tableHeaders} data={tableRows}>
        {({ onInputChange }) => (
          <>
            <TableToolbarSearch persistent onChange={onInputChange} />
            <TableToolbarMenu>
              <TableToolbarAction className={styles.toolbarMenuAction} onClick={handleRefresh}>
                {t('refresh', 'Refresh')}
              </TableToolbarAction>
            </TableToolbarMenu>
            <Button
              kind="ghost"
              renderIcon={(props) => <Add size={16} {...props} />}
              onClick={() => {
                disposeModal.current?.();
                disposeModal.current = showModal('stock-create-location-modal', { mutate });
              }}
            >
              {t('createLocation', 'Create Location')}
            </Button>
          </>
        )}
      </DataList>
    );
  }

  return (
    <div className={styles.tileContainer}>
      <Tile className={styles.tile}>
        <p className={styles.content}>{t('noLocationsToDisplay', 'No locations to display')}</p>
      </Tile>
    </div>
  );
};

export default StockLocationsItems;
