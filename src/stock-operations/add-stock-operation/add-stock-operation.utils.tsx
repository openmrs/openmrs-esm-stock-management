import { StockOperationDTO } from "../../core/api/types/stockOperation/StockOperationDTO";
import { initialStockOperationValue } from "../../core/utils/utils";
import {
  APP_STOCKMANAGEMENT_STOCKOPERATIONS,
  MAIN_STORE_LOCATION_TAG,
  TASK_STOCKMANAGEMENT_STOCKOPERATIONS_APPROVE,
  TASK_STOCKMANAGEMENT_STOCKOPERATIONS_MUTATE,
  today,
} from "../../constants";
import {
  operationFromString,
  StockOperationType,
  StockOperationTypeCanCapturePurchasePrice,
  StockOperationTypeHasPrint,
  StockOperationTypeIsNegativeQtyAllowed,
  StockOperationTypeIsQuantityOptional,
  StockOperationTypeRequiresActualBatchInformation,
  StockOperationTypeRequiresBatchUuid,
  StockOperationTypeRequiresDispatchAcknowledgement,
  StockOperationTypeRequiresStockAdjustmentReason,
} from "../../core/api/types/stockOperation/StockOperationType";
import { StockOperationItemDTO } from "../../core/api/types/stockOperation/StockOperationItemDTO";
import { InitializeResult } from "./types";
import {
  LocationTypeLocation,
  LocationTypeOther,
} from "../../core/api/types/stockOperation/LocationType";
import {
  getParties,
  getStockOperationTypes,
} from "../../stock-lookups/stock-lookups.resource";
import { Party } from "../../core/api/types/Party";

export async function initializeNewStockOperation(
  currentStockOperationType: StockOperationType,
  // urlQueryParams?: URLSearchParams,
  stockOperation?: StockOperationDTO,
  stockOperationTypes?: StockOperationType[]
): Promise<InitializeResult> {
  let model: StockOperationDTO;
  const isNew = !!stockOperation;
  const newItemsToCopy: StockOperationItemDTO[] = [];
  const showQuantityRequested = false;
  let operationTypes = stockOperationTypes;
  const canIssueStock =
    stockOperation?.permission?.isRequisitionAndCanIssueStock ?? false;
  const sourceTags =
    currentStockOperationType?.stockOperationTypeLocationScopes
      ?.filter((p) => currentStockOperationType?.hasSource && p.isSource)
      .map((p) => p.locationTag) ?? [];
  const shouldLockSource =
    sourceTags.length === 1 && sourceTags[0] === MAIN_STORE_LOCATION_TAG;

  const destinationTags =
    currentStockOperationType?.stockOperationTypeLocationScopes
      ?.filter(
        (p) => currentStockOperationType?.hasDestination && p.isDestination
      )
      .map((p) => p.locationTag) ?? [];
  const shouldLockDestination =
    destinationTags.length === 1 &&
    destinationTags[0] === MAIN_STORE_LOCATION_TAG;
  let location: string | null | undefined = null;
  let sourcePartyList: Party[] | null | undefined;
  let destinationPartyList: Party[] | null | undefined;

  if (isNew) {
    model = structuredClone({
      ...initialStockOperationValue(),
      receivedItems: [],
    });
    model = Object.assign(model, {
      operationDate: today(),
      operationTypeName: currentStockOperationType?.name,
      operationTypeUuid: currentStockOperationType?.uuid,
      operationType: currentStockOperationType?.operationType,
    });
    const partyList = await getParties();

    if (!partyList.ok) throw Error("Error loading parties");
    const filteredPartyList = partyList.data?.results?.filter(
      (party) => party.stockSourceUuid !== null
    );

    sourcePartyList = filteredPartyList?.filter(
      (p) =>
        (p.locationUuid &&
          currentStockOperationType?.sourceType === LocationTypeLocation &&
          (sourceTags.length === 0 ||
            (p.tags && sourceTags.some((x) => p.tags.includes(x))))) ||
        (p.stockSourceUuid &&
          currentStockOperationType?.sourceType === LocationTypeOther)
    );
    if (currentStockOperationType?.hasSource) {
      if (isNew && shouldLockSource && sourcePartyList?.length > 0) {
        const party = sourcePartyList[0];
        model.sourceUuid = party.uuid;
        model.sourceName = party.name;
        location = party?.locationUuid;
      }
    }

    if (currentStockOperationType?.hasDestination) {
      destinationPartyList = partyList?.data?.results?.filter(
        (p) =>
          (p.locationUuid &&
            currentStockOperationType?.destinationType ===
              LocationTypeLocation &&
            (destinationTags.length === 0 ||
              (p.tags && destinationTags.some((x) => p.tags.includes(x))))) ||
          (p.stockSourceUuid &&
            currentStockOperationType?.destinationType === LocationTypeOther)
      );

      if (isNew && shouldLockDestination && destinationPartyList?.length > 0) {
        const party = destinationPartyList[0];
        model.destinationUuid = party.uuid;
        model.destinationName = party.name;
      }
    }
  } else {
    const response = await getStockOperationTypes();
    if (response.ok) {
      operationTypes = response.data.results;
    } else {
      throw Error("Error loading operation types");
    }
  }

  const opType = operationFromString(currentStockOperationType.operationType);
  return {
    batchBalance: {},
    batchNos: {},
    itemUoM: {},
    requisition: "",
    showQuantityRequested: false,
    dto: model,
    stockItems: newItemsToCopy,
    // showQuantityRequested,
    // requisition,
    isNegativeQuantityAllowed: StockOperationTypeIsNegativeQtyAllowed(opType),
    requiresBatchUuid: StockOperationTypeRequiresBatchUuid(opType),
    requiresActualBatchInfo:
      StockOperationTypeRequiresActualBatchInformation(opType),
    isQuantityOptional: StockOperationTypeIsQuantityOptional(opType),
    canCaptureQuantityPrice: StockOperationTypeCanCapturePurchasePrice(opType),
    requiresStockAdjustmentReason:
      StockOperationTypeRequiresStockAdjustmentReason(opType),
    requiresDispatchAcknowledgement:
      StockOperationTypeRequiresDispatchAcknowledgement(opType),
    allowExpiredBatchNumbers:
      currentStockOperationType?.allowExpiredBatchNumbers ?? false,
    canEditModel: stockOperation?.permission?.canEdit ?? false,
    canViewModel: stockOperation?.permission?.canView ?? false,
    canApproveModel: stockOperation?.permission?.canApprove ?? false,
    canIssueStock,
    canReceiveItems: stockOperation?.permission?.canReceiveItems ?? false,
    canDisplayReceivedItems:
      stockOperation?.permission?.canDisplayReceivedItems ?? false,
    canUpdateItemsBatchInformation:
      stockOperation?.permission?.canUpdateBatchInformation ?? false,
    canPrint: canIssueStock || StockOperationTypeHasPrint(opType),
    sourceTags,
    destinationTags,
    shouldLockDestination,
    shouldLockSource,
    sourcePartyListFilter: (p) => {
      return (
        (p.locationUuid &&
          currentStockOperationType?.sourceType === LocationTypeLocation &&
          (sourceTags.length === 0 ||
            (p.tags && sourceTags.some((x) => p.tags.includes(x))))) ||
        (p.stockSourceUuid &&
          currentStockOperationType?.sourceType === LocationTypeOther)
      );
    },
    destinationPartyListFilter: (p) => {
      return (
        (p.locationUuid &&
          currentStockOperationType?.destinationType === LocationTypeLocation &&
          (destinationTags.length === 0 ||
            (p.tags && destinationTags.some((x) => p.tags.includes(x))))) ||
        (p.stockSourceUuid &&
          currentStockOperationType?.destinationType === LocationTypeOther)
      );
    },
    location,
    sourcePartyList,
    destinationPartyList,
    stockOperationTypes: operationTypes,
    hasQtyRequested: showQuantityRequested,
  };
}
