import React from 'react';

import { Button } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { Printer } from '@carbon/react/icons';
import { StockOperationDTO } from '../../core/api/types/stockOperation/StockOperationDTO';
import { StockOperationItemCost } from '../../core/api/types/stockOperation/StockOperationItemCost';
import { StockItemInventory } from '../../core/api/types/stockItem/StockItemInventory';

import { StockItemInventoryFilter } from '../../stock-items/stock-items.resource';
import { ResourceRepresentation } from '../../core/api/api';
import { BuildStockOperationData } from '../stock-print-reports/StockOperationReport';
import { PrintGoodsReceivedNoteStockOperation } from '../stock-print-reports/GoodsReceivedNote';
import { PrintTransferOutStockOperation } from '../stock-print-reports/StockTransferDocument';
import { PrintRequisitionStockOperation } from '../stock-print-reports/RequisitionDocument';
import { getStockItemInventory, getStockOperation, getStockOperationItemsCost } from '../stock-operations.resource';

interface StockOperationCancelButtonProps {
  operation: StockOperationDTO;
}

const StockOperationPrintButton: React.FC<StockOperationCancelButtonProps> = ({ operation }) => {
  const { t } = useTranslation();

  const onPrintStockOperation = async () => {
    try {
      let parentOperation: StockOperationDTO | null | undefined;
      let itemsCost: StockOperationItemCost[] | null | undefined = null;
      let itemInventory: StockItemInventory[] | null | undefined = null;

      if (operation.requisitionStockOperationUuid) {
        // get stock operation
        getStockOperation(operation.requisitionStockOperationUuid)
          .then((payload: any) => {
            if ((payload as any).error) {
              return;
            }
            parentOperation = payload;
          })
          .catch((error: any) => {
            if ((error as any).error) {
              return;
            }
            return;
          });
        if (!parentOperation) {
          return null;
        }
      }

      if (
        parentOperation ||
        parentOperation?.operationType === 'stockissue' ||
        parentOperation?.operationType === 'transferout'
      ) {
        const enableOperationPrintCosts = true;
        if (enableOperationPrintCosts) {
          const inventoryFilter: StockItemInventoryFilter = {};
          if (operation?.uuid) {
            inventoryFilter.stockOperationUuid = operation.uuid;
          }
          getStockOperationItemsCost(inventoryFilter)
            .then((payload: any) => {
              if ((payload as any).error) {
                return;
              }
              itemsCost = payload?.results;
            })
            .catch((error: any) => {
              if ((error as any).error) {
                return;
              }
              return;
            });
        }
      }
      const enableBalance = true;
      if (enableBalance && (parentOperation || parentOperation?.operationType === 'requisition')) {
        const inventoryFilter: StockItemInventoryFilter = {};
        if (operation?.uuid) {
          inventoryFilter.locationUuid = operation.atLocationUuid;
          inventoryFilter.stockOperationUuid = operation.uuid;
        } else {
          inventoryFilter.locationUuid = operation.atLocationUuid;
          inventoryFilter.stockOperationUuid = operation.uuid;
        }
        inventoryFilter.v = ResourceRepresentation.Default;
        inventoryFilter.groupBy = 'LocationStockItem';
        inventoryFilter.includeStockItemName = 'true';

        inventoryFilter.date = JSON.stringify(parentOperation?.dateCreated ?? operation?.dateCreated);

        // get stock item inventory
        getStockItemInventory(inventoryFilter)
          .then((payload: any) => {
            if ((payload as any).error) {
              return;
            }
            itemInventory = payload?.results;
          })
          .catch((error: any) => {
            if ((error as any).error) {
              return;
            }
            return;
          });
      }

      const data = await BuildStockOperationData(
        operation,
        operation.stockOperationItems,
        parentOperation,
        itemsCost,
        itemInventory,
      );
      if (data) {
        if (operation?.operationType === 'receipt') {
          await PrintGoodsReceivedNoteStockOperation(data);
        } else if (operation?.operationType === 'transferout') {
          await PrintTransferOutStockOperation(data);
        } else {
          await PrintRequisitionStockOperation(data);
        }
      } else {
        console.info(data);
      }
    } catch (e) {
      console.info(e);
    }
  };

  return (
    <Button onClick={onPrintStockOperation} kind="tertiary" renderIcon={(props) => <Printer size={16} {...props} />}>
      {t('print', 'Print')}
    </Button>
  );
};

export default StockOperationPrintButton;
