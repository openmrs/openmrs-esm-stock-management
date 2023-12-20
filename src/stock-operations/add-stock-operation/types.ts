import { StockOperationDTO } from "../../core/api/types/stockOperation/StockOperationDTO";
import { StockOperationItemDTO } from "../../core/api/types/stockOperation/StockOperationItemDTO";
import { Party } from "../../core/api/types/Party";
import { StockOperationType } from "../../core/api/types/stockOperation/StockOperationType";
import { SaveStockOperation } from "../../stock-items/types";
import { StockBatchDTO } from "../../core/api/types/stockItem/StockBatchDTO";
import { StockItemPackagingUOMDTO } from "../../core/api/types/stockItem/StockItemPackagingUOM";
import { StockItemInventory } from "../../core/api/types/stockItem/StockItemInventory";

export interface InitializeResult {
  dto?: StockOperationDTO;
  requisition?: string;
  stockItems?: StockOperationItemDTO[];
  showQuantityRequested?: boolean;
  isNegativeQuantityAllowed: boolean;
  requiresBatchUuid: boolean;
  requiresActualBatchInfo: boolean;
  isQuantityOptional: boolean;
  canCaptureQuantityPrice: boolean;
  requiresStockAdjustmentReason: boolean;
  requiresDispatchAcknowledgement: boolean;
  allowExpiredBatchNumbers: boolean;
  canEditModel: boolean;
  canViewModel: boolean;
  canApproveModel: boolean;
  canIssueStock: boolean;
  canReceiveItems: boolean;
  canDisplayReceivedItems: boolean;
  canUpdateItemsBatchInformation: boolean;
  canPrint: boolean;
  sourceTags: string[];
  destinationTags: string[];
  shouldLockSource: boolean;
  shouldLockDestination: boolean;
  sourcePartyListFilter?: (p: Party) => boolean;
  destinationPartyListFilter?: (p: Party) => boolean;
  location?: string;
  sourcePartyList?: Party[];
  destinationPartyList?: Party[];
  stockOperationTypes: StockOperationType[];
  hasQtyRequested: boolean;
  batchNos?: { [key: string]: StockBatchDTO[] };
  itemUoM?: { [key: string]: StockItemPackagingUOMDTO[] };
  batchBalance?: { [key: string]: StockItemInventory };
}

export interface AddStockOperationProps {
  isEditing?: boolean;
  model?: StockOperationDTO;
  onSave?: SaveStockOperation;
  operation: StockOperationType;
  operations?: StockOperationType[];
  canPrint?: boolean;
  canEdit?: boolean;
}
