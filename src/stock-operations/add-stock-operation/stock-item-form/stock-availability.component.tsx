import React, { useMemo } from 'react';
import { useStockItemBatchInformationHook } from '../../../stock-items/add-stock-item/batch-information/batch-information.resource';
import styles from './../stock-items-addition-row.scss';
const StockAvailability: React.FC<{ stockItemUuid: string }> = ({ stockItemUuid }) => {
  const { items } = useStockItemBatchInformationHook({
    stockItemUuid: stockItemUuid,
    includeBatchNo: true,
  });

  const totalQuantity = useMemo(() => {
    if (!items?.length) return 0;
    return items.reduce((total, batch) => {
      return total + (Number(batch.quantity) || 0);
    }, 0);
  }, [items]);
  const commonUOM = useMemo(() => {
    if (!items?.length) return '';
    return items[0]?.quantityUoM || '';
  }, [items]);

  return (
    <div className={styles.availability}>
      {totalQuantity > 0 ? (
        <span>
          Available: {totalQuantity.toLocaleString()} {commonUOM}
        </span>
      ) : (
        <span className={styles.outOfStock}>Out of Stock</span>
      )}
    </div>
  );
};

export default StockAvailability;
