import React, { useState } from 'react';
import { useStockLocationPages } from './stock-locations-table.resource';
import {
  Button,
  DataTableSkeleton,
  TableToolbarAction,
  TableToolbarMenu,
  TableToolbarSearch,
  Tile,
} from '@carbon/react';
import styles from '../stock-items/stock-items-table.scss';
import { ResourceRepresentation } from '../core/api/api';
import DataList from '../core/components/table/table.component';
import { useTranslation } from 'react-i18next';
import { mutate } from 'swr';
import NewLocationForm from './add-locations-form.workspace';
import { Add } from '@carbon/react/icons';
import { handleMutate } from '../utils';
import { restBaseUrl } from '@openmrs/esm-framework';

interface StockLocationsTableProps {
  status?: string;
}

const StockLocationsItems: React.FC<StockLocationsTableProps> = () => {
  const { t } = useTranslation();

  const [showLocationModal, setAddLocationModal] = useState(false);

  const { tableHeaders, tableRows, items, isLoading } = useStockLocationPages({
    v: ResourceRepresentation.Full,
  });

  const handleRefresh = () => {
    handleMutate(`${restBaseUrl}/Location?_summary=data`);
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
              <TableToolbarAction onClick={handleRefresh}>Refresh</TableToolbarAction>
            </TableToolbarMenu>
            {showLocationModal ? (
              <NewLocationForm onModalChange={setAddLocationModal} showModal={showLocationModal} mutate={mutate} />
            ) : null}
            <Button
              kind="ghost"
              renderIcon={(props) => <Add size={16} {...props} />}
              onClick={() => setAddLocationModal(true)}
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
        <p className={styles.content}>{t('noStockItemsToDisplay', 'No stock items to display')}</p>
      </Tile>
    </div>
  );
};

export default StockLocationsItems;
