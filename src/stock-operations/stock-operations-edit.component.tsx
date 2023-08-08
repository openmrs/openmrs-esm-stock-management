import {
  Arrival24,
  CheckmarkOutline24,
  CloseOutline24,
  DeliveryTruck24,
  Departure24,
  Error24,
  OverflowMenuVertical24,
  Printer24,
  Repeat24,
} from "@carbon/icons-react";
import { AccordionSkeleton, Button, Tab, Tabs } from "carbon-components-react";
import produce from "immer";
import { cloneDeep } from "lodash-es";
import React, { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { ConfirmModalPopup } from "../components/dialog/ConfirmModalPopup";
import { Splash } from "../components/spinner/Splash";
import {
  STOCK_OPERATION_PRINT_DISABLE_BALANCE_ON_HAND,
  STOCK_OPERATION_PRINT_DISABLE_COSTS,
  URL_STOCK_HOME,
  URL_STOCK_OPERATION,
  URL_STOCK_OPERATIONS,
  URL_STOCK_OPERATIONS_NEW_OPERATION,
  URL_STOCK_OPERATIONS_REDIRECT,
} from "../constants";
import { ResourceRepresentation } from "../core/api/api";
import {
  useLazyGetPartiesQuery,
  useLazyGetStockOperationTypesQuery,
} from "../core/api/lookups";
import {
  StockItemInventoryFilter,
  useLazyGetStockItemInventoryQuery,
  useLazyGetStockOperationItemsCostQuery,
} from "../core/api/stockItem";
import {
  useCreateStockOperationMutation,
  useDeleteStockOperationItemMutation,
  useExecuteStockOperationActionMutation,
  useLazyGetStockOperationAndItemsQuery,
  useLazyGetStockOperationLinksQuery,
  useUpdateStockOperationBatchNumbersMutation,
  useUpdateStockOperationMutation,
} from "../core/api/stockOperation";
import { PageableResult } from "../core/api/types/PageableResult";
import { Party } from "../core/api/types/Party";
import { PrivilegeScope } from "../core/api/types/identity/PriviledgeScope";
import { StockItemInventory } from "../core/api/types/stockItem/StockItemInventory";
import {
  LocationTypeLocation,
  LocationTypeOther,
} from "../core/api/types/stockOperation/LocationType";
import {
  StockOperationActionLineItem,
  StopOperationAction,
  StopOperationActionType,
} from "../core/api/types/stockOperation/StockOperationAction";
import { StockOperationDTO } from "../core/api/types/stockOperation/StockOperationDTO";
import { StockOperationItemCost } from "../core/api/types/stockOperation/StockOperationItemCost";
import { StockOperationItemDTO } from "../core/api/types/stockOperation/StockOperationItemDTO";
import {
  StockOperationStatusCancelled,
  StockOperationStatusNew,
  StockOperationStatusRejected,
  StockOperationStatusReturned,
} from "../core/api/types/stockOperation/StockOperationStatus";
import {
  REQUISITION_OPERATION_TYPE,
  STOCK_ISSUE_OPERATION_TYPE,
  StockOperationPrintHasItemCosts,
  StockOperationType,
  StockOperationTypeCanBeRelatedToRequisition,
  StockOperationTypeCanCapturePurchasePrice,
  StockOperationTypeHasPrint,
  StockOperationTypeIsNegativeQtyAllowed,
  StockOperationTypeIsQuantityOptional,
  StockOperationTypeIsReceipt,
  StockOperationTypeIsRequistion,
  StockOperationTypeIsTransferOut,
  StockOperationTypeRequiresActualBatchInformation,
  StockOperationTypeRequiresBatchUuid,
  StockOperationTypeRequiresDispatchAcknowledgement,
  StockOperationTypeRequiresStockAdjustmentReason,
} from "../core/api/types/stockOperation/StockOperationType";
import { MAIN_STORE_LOCATION_TAG } from "../core/consts";
import {
  APP_STOCKMANAGEMENT_STOCKOPERATIONS,
  TASK_STOCKMANAGEMENT_STOCKOPERATIONS_APPROVE,
  TASK_STOCKMANAGEMENT_STOCKOPERATIONS_MUTATE,
} from "../core/privileges";
import { errorAlert, errorMessage, successAlert } from "../core/utils/alert";
import { BreadCrumbs } from "../core/utils/breadCrumbs";
import {
  formatDisplayDateTime,
  isDateAfterToday,
  today,
} from "../core/utils/datetimeUtils";
import {
  getStockOperationUniqueId,
  isNullOrEmptryOrWhiteSpace,
  toErrorMessage,
} from "../core/utils/stringUtils";
import useTranslation from "../core/utils/translation";
import { useUrlQueryParams } from "../core/utils/urlUtils";
import { useGetPrivilegeScopes } from "../stock-auth/AccessControl";
import { EditStockOperation } from "./edit-stock-operation.component";
import ReceiveItemsTable from "./receive-items-table.component";
import { PrintGoodsReceivedNoteStockOperation } from "./reports/GoodsReceivedNote";
import { PrintRequisitionStockOperation } from "./reports/RequisitionDocument";
import { BuildStockOperationData } from "./reports/StockOperationReport";
import { PrintTransferOutStockOperation } from "./reports/StockTransferDocument";
import StockOperationItemsTable from "./stock-operation-items-table.component";
import { SubmitApproval } from "./submit-approval.component";

const handleErrors = (payload: any) => {
  var errorMessage = toErrorMessage(payload);
  errorAlert(`${errorMessage}`);
  return;
};

export const StockOperationsEdit = () => {
  const { id } = useParams();
  const urlQueryParams = useUrlQueryParams();
  const currentLocation = useLocation();
  const { t } = useTranslation();
  const [showLoading, setShowLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [editableModel, setEditableMode] = useState<StockOperationDTO>({
    operationDate: today(),
  } as unknown as StockOperationDTO);
  const [canEdit, setCanEdit] = useState(false);
  const [canApprove, setCanApprove] = useState(false);
  const [canReceiveItems, setCanReceiveItems] = useState(false);
  const [canDisplayReceivedItems, setCanDisplayReceivedItems] = useState(false);
  const [isRequisitionAndCanIssueStock, setIsRequisitionAndCanIssueStock] =
    useState(false);
  const [canPrint, setCanPrint] = useState(false);
  const [hasItems, setHasItems] = useState<boolean>(false);
  const [showItems, setShowItems] = useState<boolean>(false);
  const [showComplete, setShowComplete] = useState<boolean>(false);
  const [sourcePartyList, setSourcePartyList] = useState<Party[]>([]);
  const [lockSource, setLockSource] = useState(true);
  const [destinationPartyList, setDestinationPartyList] = useState<Party[]>([]);
  const [lockDestination, setLockDestination] = useState(true);
  const [stockOperationType, setStockOperationType] = useState<
    StockOperationType | null | undefined
  >(null);
  const [getStockOperation] = useLazyGetStockOperationAndItemsQuery();
  const [getStockOperationItemsCost] = useLazyGetStockOperationItemsCostQuery();
  const [getStockOperationTypes] = useLazyGetStockOperationTypesQuery();
  const [
    getStockOperationLinks,
    { data: stockOperationLinks, isSuccess: fetchedStockOperationLinks },
  ] = useLazyGetStockOperationLinksQuery();
  const [getPartyList] = useLazyGetPartiesQuery();
  const userPrivilegeScopes = useGetPrivilegeScopes([
    TASK_STOCKMANAGEMENT_STOCKOPERATIONS_MUTATE,
    APP_STOCKMANAGEMENT_STOCKOPERATIONS,
    TASK_STOCKMANAGEMENT_STOCKOPERATIONS_APPROVE,
  ]);
  const navigate = useNavigate();
  const [stockOperationItems, setStockOperationItems] = useState<
    StockOperationItemDTO[]
  >([{ uuid: `new-item-1`, id: `new-item-1` }]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [isNegativeQtyAllowed, setIsNegativeQtyAllowed] = useState(false);
  const [allowExpiredBatchNumbers, setAllowExpiredBatchNumbers] =
    useState(false);
  const [requiresBatchUuid, setRequiresBatchUuid] = useState(false);
  const [requiresActualBatchInformation, setRequiresActualBatchInformation] =
    useState(false);
  const [requireStockAdjustmentReason, setRequireStockAdjustmentReason] =
    useState(false);
  const [requiresDispatchAcknowledgement, setRequiresDispatchAcknowledgement] =
    useState(false);
  const [isQuantityOptional, setIsQuantityOptional] = useState(false);
  const [canCapturePurchasePrice, setCanCapturePurchasePrice] = useState(false);
  const [createStockOperation] = useCreateStockOperationMutation();
  const [updateStockOperation] = useUpdateStockOperationMutation();
  const [updateStockOperationBatchNumbers] =
    useUpdateStockOperationBatchNumbersMutation();
  const [deleteStockOperationItem] = useDeleteStockOperationItemMutation();
  const [executeStockOperationAction] =
    useExecuteStockOperationActionMutation();
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmHeading, setConfirmHeading] = useState("");
  const [confirmLabel, setConfirmLabel] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [confirmType, setConfirmType] = useState("");
  const [confirmDefaultReason, setConfirmDefaultReason] = useState("");
  const [confirmParam, setConfirmParam] = useState("");
  const [confirmRequireReason, setConfirmRequireReason] = useState(false);
  const [itemValidity, setItemValidity] = useState<{
    [key: string]: { [key: string]: boolean };
  }>({});
  const [receivedItemValidity, setReceivedItemValidity] = useState<{
    [key: string]: { [key: string]: boolean };
  }>({});
  const [requisitionUuid, setRequisitionUuid] = useState<string | null>(null);
  const [showQuantityRequested, setShowQuantityRequested] = useState(false);
  const [getStockItemInventory] = useLazyGetStockItemInventoryQuery();
  const [canUpdateBatchInformation, setCanUpdateBatchInformation] =
    useState(false);
  const [atLocation, setAtLocation] = useState<string | null>();
  const [batchBalance, setBatchBalance] = useState<{
    [key: string]: StockItemInventory;
  }>({});

  useEffect(() => {
    async function loadStockOperation() {
      let requisition: string | null = null;
      setShowLoading(true);
      let isNewOperation =
        null === id || id === undefined || id.indexOf("-") < 0;
      setIsNew(isNewOperation);
      let stockOperation: StockOperationDTO = {
        operationDate: today(),
      } as unknown as StockOperationDTO;
      if (!isNewOperation) {
        let failedToLoadStockOperation = false;
        await getStockOperation(id!, false)
          .unwrap()
          .then((payload: any) => {
            if ((payload as any).error) {
              handleErrors(payload);
              failedToLoadStockOperation = true;
              return;
            }
            stockOperation = cloneDeep(payload) as StockOperationDTO;
            setAtLocation(stockOperation.atLocationUuid);
            if (
              !stockOperation.responsiblePersonUuid &&
              stockOperation.responsiblePersonOther
            ) {
              stockOperation.responsiblePersonUuid = "Other";
            }
            if (stockOperation && stockOperation.stockOperationItems) {
              let hasQtyRequested = false;
              stockOperation.stockOperationItems.forEach((si, ii, iar) => {
                (si as any)["id"] = si.uuid;
                if (
                  si.quantityRequested &&
                  si.quantityRequestedPackagingUOMName
                ) {
                  hasQtyRequested = true;
                }
              });
              if (hasQtyRequested) {
                setShowQuantityRequested(true);
              }
            }
          })
          .catch((error: any) => {
            handleErrors(error);
            failedToLoadStockOperation = true;
            return;
          });
        if (failedToLoadStockOperation) {
          navigate(URL_STOCK_OPERATIONS);
          return;
        }
      }

      let stockOperationTypes: StockOperationType[] = [];
      await getStockOperationTypes()
        .unwrap()
        .then((payload: any) => {
          if ((payload as any).error) {
            handleErrors(payload);
            navigate(URL_STOCK_OPERATIONS);
            return;
          }
          stockOperationTypes = (payload as PageableResult<StockOperationType>)
            .results;
        })
        .catch((error: any) => handleErrors(error));

      let currentStockOperationType = stockOperationTypes?.find((p) =>
        isNewOperation
          ? p.operationType === id
          : p.uuid === stockOperation?.operationTypeUuid
      );
      setStockOperationType(currentStockOperationType);
      setIsNegativeQtyAllowed(
        StockOperationTypeIsNegativeQtyAllowed(
          currentStockOperationType?.operationType ?? ""
        )
      );
      setRequiresBatchUuid(
        StockOperationTypeRequiresBatchUuid(
          currentStockOperationType?.operationType ?? ""
        )
      );
      setRequiresActualBatchInformation(
        StockOperationTypeRequiresActualBatchInformation(
          currentStockOperationType?.operationType ?? ""
        )
      );
      setIsQuantityOptional(
        StockOperationTypeIsQuantityOptional(
          currentStockOperationType?.operationType ?? ""
        )
      );
      setCanCapturePurchasePrice(
        StockOperationTypeCanCapturePurchasePrice(
          currentStockOperationType?.operationType ?? ""
        )
      );
      setRequireStockAdjustmentReason(
        StockOperationTypeRequiresStockAdjustmentReason(
          currentStockOperationType?.operationType ?? ""
        )
      );
      setRequiresDispatchAcknowledgement(
        StockOperationTypeRequiresDispatchAcknowledgement(
          currentStockOperationType?.operationType ?? ""
        )
      );
      setAllowExpiredBatchNumbers(
        currentStockOperationType?.allowExpiredBatchNumbers ?? false
      );
      if (isNewOperation) {
        stockOperation = {
          operationDate: today(),
          operationTypeName: currentStockOperationType?.name,
          operationTypeUuid: currentStockOperationType?.uuid,
          operationType: currentStockOperationType?.operationType,
        } as any as StockOperationDTO;
        if (
          StockOperationTypeCanBeRelatedToRequisition(
            currentStockOperationType?.operationType ?? ""
          )
        ) {
          try {
            requisition = urlQueryParams.get("requisition");
            if (requisition) {
              await getStockOperation(requisition, false)
                .unwrap()
                .then((payload: any) => {
                  if ((payload as any).error) {
                    handleErrors(payload);
                    return;
                  }
                  let requisitionStockOperation = cloneDeep(
                    payload
                  ) as StockOperationDTO;
                  if (
                    !requisitionStockOperation.responsiblePersonUuid &&
                    requisitionStockOperation.responsiblePersonOther
                  ) {
                    requisitionStockOperation.responsiblePersonUuid = "Other";
                  }
                  let newItemsToCopy: StockOperationItemDTO[] = [];
                  if (
                    requisitionStockOperation &&
                    requisitionStockOperation.stockOperationItems
                  ) {
                    let hasQtyRequested = false;
                    requisitionStockOperation.stockOperationItems.forEach(
                      (si, ii, iar) => {
                        if (si.quantity && si.stockItemPackagingUOMName) {
                          hasQtyRequested = true;
                        }

                        let itemId = `new-item-${getStockOperationUniqueId()}`;
                        (si as any)["id"] = itemId;
                        (si as any)["uuid"] = itemId;
                        newItemsToCopy.push({
                          ...si,
                          quantityRequested: si.quantity,
                          quantityRequestedPackagingUOMUuid:
                            si.stockItemPackagingUOMUuid,
                          quantityRequestedPackagingUOMName:
                            si.stockItemPackagingUOMName,
                        });
                      }
                    );
                    if (hasQtyRequested) {
                      setShowQuantityRequested(true);
                    }
                  }
                  newItemsToCopy.push({ uuid: `new-item-1`, id: `new-item-1` });
                  stockOperation.destinationUuid =
                    requisitionStockOperation.sourceUuid;
                  stockOperation.destinationName =
                    requisitionStockOperation.sourceName;
                  stockOperation.responsiblePersonUuid =
                    requisitionStockOperation.responsiblePersonUuid;
                  stockOperation.responsiblePersonOther =
                    requisitionStockOperation.responsiblePersonOther;
                  stockOperation.responsiblePersonFamilyName =
                    requisitionStockOperation.responsiblePersonFamilyName;
                  stockOperation.responsiblePersonGivenName =
                    requisitionStockOperation.responsiblePersonGivenName;
                  stockOperation.remarks = requisitionStockOperation.remarks;
                  setRequisitionUuid(requisition!);
                  setStockOperationItems(newItemsToCopy);
                })
                .catch((error: any) => {
                  handleErrors(error);
                  return;
                });
            }
          } catch (e) {}
        }
      }

      let canEditModel: boolean = false;
      let canViewModel: boolean = false;
      let canApproveModel: boolean = false;
      let applicablePrivilegeScopes: PrivilegeScope[] | null = null;
      if (isNewOperation) {
        applicablePrivilegeScopes = userPrivilegeScopes?.filter(
          (p) =>
            p.privilege === TASK_STOCKMANAGEMENT_STOCKOPERATIONS_MUTATE &&
            p.operationTypeUuid === currentStockOperationType?.uuid
        );
        canEditModel = applicablePrivilegeScopes?.length > 0;
        setCanEdit(canEditModel);
        if (!canEditModel) {
          errorAlert(
            t("stockmanagement.stockoperation.nomutateprivilegescopes")
          );
          navigate(URL_STOCK_OPERATIONS);
          return;
        }
      } else {
        canEditModel = stockOperation?.permission?.canEdit ?? false;
        canViewModel = stockOperation?.permission?.canView ?? false;
        canApproveModel = stockOperation?.permission?.canApprove ?? false;
        let canIssueStock =
          stockOperation?.permission?.isRequisitionAndCanIssueStock ?? false;
        let canReceiveItems =
          stockOperation?.permission?.canReceiveItems ?? false;
        let canDisplayReceivedItems =
          stockOperation?.permission?.canDisplayReceivedItems ?? false;
        let canUpdateItemsBatchInformation =
          stockOperation?.permission?.canUpdateBatchInformation ?? false;

        setCanEdit(canEditModel);
        setCanApprove(canApproveModel);
        setCanReceiveItems(canReceiveItems);
        setCanDisplayReceivedItems(canDisplayReceivedItems);
        setCanUpdateBatchInformation(canUpdateItemsBatchInformation);

        setIsRequisitionAndCanIssueStock(canIssueStock);
        setCanPrint(
          canIssueStock ||
            StockOperationTypeHasPrint(stockOperation?.operationType!)
        );
      }

      if (!canEditModel && !canViewModel && !canApproveModel) {
        errorAlert(t("stockmanagement.stockoperation.noaccessprivilegescopes"));
        navigate(URL_STOCK_OPERATIONS);
        return;
      }

      if (canEditModel) {
        let partyList: Party[] = [];
        await getPartyList()
          .unwrap()
          .then((payload: any) => {
            if ((payload as any).error) {
              handleErrors(payload);
              return;
            }
            partyList = (payload as PageableResult<Party>).results;
          })
          .catch((error: any) => handleErrors(error));

        applicablePrivilegeScopes =
          applicablePrivilegeScopes ??
          userPrivilegeScopes?.filter(
            (p) =>
              p.privilege === TASK_STOCKMANAGEMENT_STOCKOPERATIONS_MUTATE &&
              p.operationTypeUuid === currentStockOperationType?.uuid
          );
        if (applicablePrivilegeScopes.length === 0) {
          errorAlert(
            t("stockmanagement.stockoperation.nomutateprivilegescopes")
          );
          navigate(URL_STOCK_OPERATIONS);
          return;
        }
        let sourceTags =
          currentStockOperationType?.stockOperationTypeLocationScopes
            ?.filter((p) => currentStockOperationType?.hasSource && p.isSource)
            .map((p) => p.locationTag) ?? [];
        let toLockSource =
          sourceTags.length === 1 && sourceTags[0] === MAIN_STORE_LOCATION_TAG;
        let destinationTags =
          currentStockOperationType?.stockOperationTypeLocationScopes
            ?.filter(
              (p) =>
                currentStockOperationType?.hasDestination && p.isDestination
            )
            .map((p) => p.locationTag) ?? [];
        let toLockDestination =
          destinationTags.length === 1 &&
          destinationTags[0] === MAIN_STORE_LOCATION_TAG;

        let requiredSources: string[] | null = null;
        let requiredDestinations: string[] | null = null;
        if (
          currentStockOperationType?.hasSource &&
          currentStockOperationType?.sourceType === LocationTypeLocation
        ) {
          requiredSources = applicablePrivilegeScopes.map(
            (p) => p.locationUuid!
          );
        } else if (
          currentStockOperationType?.hasDestination &&
          currentStockOperationType?.destinationType === LocationTypeLocation
        ) {
          requiredDestinations = applicablePrivilegeScopes.map(
            (p) => p.locationUuid!
          );
        }
        if (requiredSources == null && requiredDestinations == null) {
          errorAlert(
            t(
              "stockmanagement.stockoperation.operationtypelocationtyperequired"
            )
          );
          navigate(URL_STOCK_OPERATIONS);
          return;
        }

        if (currentStockOperationType?.hasSource) {
          let result = partyList?.filter(
            (p) =>
              (p.locationUuid &&
                currentStockOperationType?.sourceType ===
                  LocationTypeLocation &&
                (sourceTags.length === 0 ||
                  (p.tags && sourceTags.some((x) => p.tags.includes(x))))) ||
              (p.stockSourceUuid &&
                currentStockOperationType?.sourceType === LocationTypeOther)
          );
          if (requiredSources) {
            result = result.filter((p) =>
              requiredSources?.includes(p.locationUuid)
            );
            if (result.length === 0) {
              errorAlert(
                t(
                  "stockmanagement.stockoperation.operationtypelocationtagsnomatch"
                )
              );
              navigate(URL_STOCK_OPERATIONS);
              return;
            }
          }

          setSourcePartyList(result);
          setLockSource(toLockSource);
          if (isNewOperation && toLockSource && result?.length > 0) {
            let party = result[0];
            stockOperation.sourceUuid = party.uuid;
            stockOperation.sourceName = party.name;
            setAtLocation(party?.locationUuid);
          }
        }

        if (currentStockOperationType?.hasDestination) {
          let result = partyList?.filter(
            (p) =>
              (p.locationUuid &&
                currentStockOperationType?.destinationType ===
                  LocationTypeLocation &&
                (destinationTags.length === 0 ||
                  (p.tags &&
                    destinationTags.some((x) => p.tags.includes(x))))) ||
              (p.stockSourceUuid &&
                currentStockOperationType?.destinationType ===
                  LocationTypeOther)
          );
          if (requiredDestinations) {
            result = result.filter((p) =>
              requiredDestinations?.includes(p.locationUuid)
            );
            if (result.length === 0) {
              errorAlert(
                t(
                  "stockmanagement.stockoperation.operationtypelocationtagsnomatch"
                )
              );
              navigate(URL_STOCK_OPERATIONS);
              return;
            }
          }
          setDestinationPartyList(result);
          setLockDestination(toLockDestination);
          if (isNewOperation && toLockDestination && result?.length > 0) {
            let party = result[0];
            stockOperation.destinationUuid = party.uuid;
            stockOperation.destinationName = party.name;
          }
        }
      }

      setEditableMode(stockOperation);
      if (!isNewOperation) {
        let opItems: StockOperationItemDTO[] = [];
        if (
          stockOperation.stockOperationItems &&
          stockOperation.stockOperationItems.length > 0
        ) {
          setHasItems(true);
          setShowItems(true);
          setShowComplete(true);
          opItems = stockOperation.stockOperationItems;
          stockOperation.stockOperationItems = [];
        }
        if (canEditModel) {
          let itemId = `new-item-${getStockOperationUniqueId()}`;
          opItems.push({ uuid: itemId, id: itemId });
        }
        setStockOperationItems(opItems);
        try {
          let tabString: string | null = urlQueryParams.get("tab");
          if (tabString) {
            let tab: number = parseInt(tabString);
            if (tab >= 0 && tab <= 2) {
              setSelectedTab(tab);
            }
          }
        } catch (e) {}
      }
      setShowLoading(false);
      if (
        (isNewOperation && requisition) ||
        (!isNewOperation &&
          (StockOperationTypeCanBeRelatedToRequisition(
            currentStockOperationType?.operationType!
          ) ||
            REQUISITION_OPERATION_TYPE ===
              currentStockOperationType?.operationType))
      ) {
        let operationToCheckUuid = requisition ?? stockOperation.uuid;
        if (operationToCheckUuid) {
          getStockOperationLinks(operationToCheckUuid);
        }
      }
    }
    loadStockOperation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, currentLocation]);

  const isStockOperationItemEmpty = useCallback(
    (itemDto: StockOperationItemDTO): boolean => {
      if (itemDto == null) return true;
      if (itemDto.stockItemUuid) return false;
      if (
        requiresActualBatchInformation &&
        (itemDto.batchNo || itemDto.expiration)
      )
        return false;
      else if (requiresBatchUuid && itemDto.stockBatchUuid) return false;
      if (itemDto.quantity) return false;
      if (itemDto.stockItemPackagingUOMUuid) return false;
      if (itemDto.purchasePrice) return false;
      return true;
    },
    [requiresActualBatchInformation, requiresBatchUuid]
  );

  const validateReceivedItems = useCallback(() => {
    let validItems = true;
    let validationStatus: { [key: string]: { [key: string]: boolean } } = {};
    stockOperationItems.forEach((p) => {
      validationStatus[p.uuid!] = {};
      if (!p.quantityReceivedPackagingUOMUuid) {
        validationStatus[p.uuid!]["quantityReceivedPackagingUOMUuid"] = false;
        validItems = false;
      }

      if (!p.quantity || p.quantity < 0) {
        validationStatus[p.uuid!]["quantity"] = false;
        validItems = false;
      }
    });
    if (!validItems) {
      errorAlert(
        t("stockmanagement.stockoperation.edit.receiveditemsnotvalid")
      );
    }
    setReceivedItemValidity(validationStatus);
    return validItems;
  }, [stockOperationItems, t]);

  const validateItems = useCallback(() => {
    let validItems = true;
    let validationStatus: { [key: string]: { [key: string]: boolean } } = {};
    let emptyCount = 0;
    stockOperationItems.forEach((p) => {
      validationStatus[p.uuid!] = {};
      if (isStockOperationItemEmpty(p)) {
        emptyCount++;
        return;
      }

      if (!p.stockItemUuid) {
        validationStatus[p.uuid!]["stockItemUuid"] = false;
        validItems = false;
      }

      if (requiresBatchUuid) {
        if (!p.stockBatchUuid) {
          validationStatus[p.uuid!]["stockBatchUuid"] = false;
          validItems = false;
        }
      } else if (requiresActualBatchInformation) {
        if (isNullOrEmptryOrWhiteSpace(p.batchNo)) {
          validationStatus[p.uuid!]["batchNo"] = false;
          validItems = false;
        }
        if (
          p.hasExpiration &&
          (!p.expiration || !isDateAfterToday(p.expiration))
        ) {
          validationStatus[p.uuid!]["expiration"] = false;
          validItems = false;
        }
      }

      if (!isQuantityOptional) {
        if (!p.quantity || (!isNegativeQtyAllowed && p.quantity < 0)) {
          validationStatus[p.uuid!]["quantity"] = false;
          validItems = false;
        }

        if (!p.stockItemPackagingUOMUuid) {
          validationStatus[p.uuid!]["stockItemPackagingUOMUuid"] = false;
          validItems = false;
        }
      } else {
        if (p.quantity && !p.stockItemPackagingUOMUuid) {
          validationStatus[p.uuid!]["stockItemPackagingUOMUuid"] = false;
          validItems = false;
        } else if (
          p.stockItemPackagingUOMUuid &&
          (!p.quantity || (!isNegativeQtyAllowed && p.quantity < 0))
        ) {
          validationStatus[p.uuid!]["quantity"] = false;
          validItems = false;
        }
      }

      if (canCapturePurchasePrice) {
        if (p.purchasePrice && p.purchasePrice < 0) {
          validationStatus[p.uuid!]["purchasePrice"] = false;
          validItems = false;
        }
      }
    });
    if (emptyCount === stockOperationItems.length) {
      validItems = false;
      errorAlert(t("stockmanagement.stockoperation.edit.oneitemrequired"));
    } else if (!validItems) {
      errorAlert(t("stockmanagement.stockoperation.edit.itemsnotvalid"));
    }
    setItemValidity(validationStatus);
    return validItems;
  }, [
    canCapturePurchasePrice,
    isNegativeQtyAllowed,
    isQuantityOptional,
    isStockOperationItemEmpty,
    requiresActualBatchInformation,
    requiresBatchUuid,
    stockOperationItems,
    t,
  ]);

  useEffect(() => {
    let breadCrumbs = new BreadCrumbs()
      .withHome()
      .withLabel(t("stockmanagement.dashboard.title"), URL_STOCK_HOME)
      .withLabel(
        t("stockmanagement.stockoperation.list.title"),
        URL_STOCK_OPERATIONS
      );
    if (isNew) {
      breadCrumbs.withLabel(
        `${t("stockmanagement.stockoperation.new.title")}: ${
          stockOperationType?.name ?? ""
        }`,
        URL_STOCK_OPERATIONS_NEW_OPERATION(
          stockOperationType?.operationType ?? ""
        )
      );
    } else {
      breadCrumbs.withLabel(
        `${editableModel?.operationTypeName ?? ""}: ${
          editableModel?.operationNumber ?? ""
        }`,
        URL_STOCK_OPERATION(id!)
      );
    }
    breadCrumbs.generateBreadcrumbHtml();
  }, [
    t,
    id,
    isNew,
    stockOperationType?.name,
    editableModel?.operationTypeName,
    editableModel?.operationNumber,
    stockOperationType?.operationType,
  ]);

  const validatItemsBatchInformation = useCallback(() => {
    let validItems = true;
    let validationStatus: { [key: string]: { [key: string]: boolean } } = {};
    let emptyCount = 0;
    stockOperationItems.forEach((p) => {
      validationStatus[p.uuid!] = {};
      if (requiresActualBatchInformation) {
        if (isNullOrEmptryOrWhiteSpace(p.batchNo)) {
          validationStatus[p.uuid!]["batchNo"] = false;
          validItems = false;
        }
        if (
          p.hasExpiration &&
          (!p.expiration || !isDateAfterToday(p.expiration))
        ) {
          validationStatus[p.uuid!]["expiration"] = false;
          validItems = false;
        }
      }
    });
    if (emptyCount === stockOperationItems.length) {
      validItems = false;
      errorAlert(t("stockmanagement.stockoperation.edit.oneitemrequired"));
    } else if (!validItems) {
      errorAlert(t("stockmanagement.stockoperation.edit.itemsnotvalid"));
    }
    setItemValidity(validationStatus);
    return validItems;
  }, [requiresActualBatchInformation, stockOperationItems, t]);

  useEffect(() => {
    let breadCrumbs = new BreadCrumbs()
      .withHome()
      .withLabel(t("stockmanagement.dashboard.title"), URL_STOCK_HOME)
      .withLabel(
        t("stockmanagement.stockoperation.list.title"),
        URL_STOCK_OPERATIONS
      );
    if (isNew) {
      breadCrumbs.withLabel(
        `${t("stockmanagement.stockoperation.new.title")}: ${
          stockOperationType?.name ?? ""
        }`,
        URL_STOCK_OPERATIONS_NEW_OPERATION(
          stockOperationType?.operationType ?? ""
        )
      );
    } else {
      breadCrumbs.withLabel(
        `${editableModel?.operationTypeName ?? ""}: ${
          editableModel?.operationNumber ?? ""
        }`,
        URL_STOCK_OPERATION(id!)
      );
    }
    breadCrumbs.generateBreadcrumbHtml();
  }, [
    t,
    id,
    isNew,
    stockOperationType?.name,
    editableModel?.operationTypeName,
    editableModel?.operationNumber,
    stockOperationType?.operationType,
  ]);

  const addNewStockOperationItem = useCallback(() => {
    let newId = getStockOperationUniqueId();
    let newItems = [
      ...stockOperationItems,
      {
        id: `new-item-${newId}`,
        edit: true,
        uuid: `new-item-${newId}`,
        permission: { canView: true, canEdit: true },
        hasExpiration: true,
      } as any as StockOperationItemDTO,
    ];
    setStockOperationItems(newItems);
  }, [stockOperationItems]);

  const getUpdateStockOperationModel = useCallback((): any => {
    let stockOperation = {
      destinationUuid: editableModel.destinationUuid,
      externalReference: editableModel.externalReference,
      operationDate: editableModel.operationDate,
      reasonUuid: editableModel.reasonUuid,
      remarks: editableModel.remarks,
      sourceUuid: editableModel.sourceUuid,
      responsiblePersonUuid:
        editableModel.responsiblePersonUuid === "Other"
          ? null
          : editableModel.responsiblePersonUuid,
      approvalRequired: editableModel.approvalRequired,
      responsiblePersonOther: editableModel.responsiblePersonOther,
    } as any;

    if (isNew) {
      stockOperation["operationTypeUuid"] = editableModel.operationTypeUuid;
      stockOperation["requisitionStockOperationUuid"] =
        StockOperationTypeCanBeRelatedToRequisition(
          stockOperationType?.operationType!
        )
          ? requisitionUuid
          : null;
    }

    let items: any[] = [];
    stockOperationItems.forEach((p) => {
      if (p.uuid?.startsWith("new-item") && isStockOperationItemEmpty(p))
        return;
      let newItem = {
        stockItemUuid: p.stockItemUuid,
        stockItemPackagingUOMUuid: p.stockItemPackagingUOMUuid,
        stockBatchUuid: p.stockBatchUuid,
        batchNo: p.batchNo,
        expiration: p.expiration,
        quantity: p.quantity,
        purchasePrice: p.purchasePrice,
      } as any;
      if (!p.uuid?.startsWith("new-item")) {
        newItem["uuid"] = p.uuid;
      } else if (
        StockOperationTypeCanBeRelatedToRequisition(
          stockOperationType?.operationType ?? ""
        ) &&
        requisitionUuid
      ) {
        newItem["quantityRequested"] = p.quantityRequested;
        newItem["quantityRequestedPackagingUOMUuid"] =
          p.quantityRequestedPackagingUOMUuid;
      }
      items.push(newItem);
    });
    stockOperation["stockOperationItems"] = items;
    return stockOperation;
  }, [
    editableModel.approvalRequired,
    editableModel.destinationUuid,
    editableModel.externalReference,
    editableModel.operationDate,
    editableModel.operationTypeUuid,
    editableModel.reasonUuid,
    editableModel.remarks,
    editableModel.responsiblePersonOther,
    editableModel.responsiblePersonUuid,
    editableModel.sourceUuid,
    isNew,
    isStockOperationItemEmpty,
    requisitionUuid,
    stockOperationItems,
    stockOperationType?.operationType,
  ]);

  const getUpdateBatchInfoStockOperationModel = useCallback((): any => {
    let items: any[] = [];
    stockOperationItems.forEach((p) => {
      if (p?.permission?.canUpdateBatchInformation) {
        let newItem = {
          uuid: p.uuid,
          batchNo: p.batchNo ?? null,
          expiration: p.expiration ?? null,
        } as any;
        items.push(newItem);
      }
    });
    return { batchNumbers: items };
  }, [stockOperationItems]);

  const completeDispatch = useCallback(async () => {
    setShowSplash(true);
    if (!validateReceivedItems()) {
      setShowSplash(false);
      return;
    }
    let hideSplash = true;
    let saveSuccess = true;
    try {
      // let lineItems: StockOperationActionLineItem[] = stockOperationItems.map(p => {
      //   return { uuid: p.uuid!, amount: p.quantityReceived!, packagingUoMUuId: p.quantityReceivedPackagingUOMUuid! };
      // });
      // let operationAction: StopOperationAction = { name: "QUANTITY_RECEIVED", uuid: editableModel?.uuid!, lineItems: lineItems };
      // await executeStockOperationAction(operationAction).unwrap().then(
      //   (confirmPayload: any) => {
      //     if (confirmPayload && (confirmPayload as any).error) {
      //       var errorToken = toErrorMessage(confirmPayload);
      //       errorMessage(`${t(`stockmanagement.stockoperation.qtyreceivedfailed`)} ${errorToken}`);
      //       return;
      //     }
      //     else {
      //       saveSuccess = true;
      //       successAlert(`${t(`stockmanagement.stockoperation.qtyreceivedsuccess`)}`);
      //     }
      //   })
      //   .catch((error) => {
      //     var errorToken = toErrorMessage(error);
      //     errorMessage(`${t(`stockmanagement.stockoperation.qtyreceivedfailed`)} ${errorToken}`);
      //     return;
      //   });

      if (saveSuccess) {
        await executeStockOperationAction({
          name: "COMPLETE",
          uuid: editableModel?.uuid!,
        })
          .unwrap()
          .then((submitPayload: any) => {
            if (submitPayload && (submitPayload as any).error) {
              var errorToken = toErrorMessage(submitPayload);
              errorMessage(
                `${t(
                  "stockmanagement.stockoperation.completefailed"
                )} ${errorToken}`
              );
              return;
            } else {
              successAlert(
                `${t("stockmanagement.stockoperation.completesuccess")}`
              );
            }
          })
          .catch((error) => {
            var errorToken = toErrorMessage(error);
            errorMessage(
              `${t(
                "stockmanagement.stockoperation.completefailed"
              )} ${errorToken}`
            );
            return;
          });

        setShowSplash(false);
        hideSplash = false;
        navigate(
          URL_STOCK_OPERATIONS_REDIRECT(
            editableModel?.uuid!,
            selectedTab?.toString() ?? ""
          )
        );
      } else {
        setShowSplash(false);
        hideSplash = false;
      }
    } finally {
      if (hideSplash) {
        setShowSplash(false);
      }
    }
  }, [
    editableModel?.uuid,
    executeStockOperationAction,
    navigate,
    selectedTab,
    t,
    validateReceivedItems,
  ]);

  const handleSaveReceivedItems = useCallback(async () => {
    setShowSplash(true);
    if (!validateReceivedItems()) {
      setShowSplash(false);
      return;
    }
    let hideSplash = true;
    try {
      let lineItems: StockOperationActionLineItem[] = stockOperationItems.map(
        (p) => {
          return {
            uuid: p.uuid!,
            amount: p.quantityReceived!,
            packagingUoMUuId: p.quantityReceivedPackagingUOMUuid!,
          };
        }
      );
      let operationAction: StopOperationAction = {
        name: "QUANTITY_RECEIVED",
        uuid: editableModel?.uuid!,
        lineItems: lineItems,
      };
      await executeStockOperationAction(operationAction)
        .unwrap()
        .then((confirmPayload: any) => {
          if (confirmPayload && (confirmPayload as any).error) {
            var errorToken = toErrorMessage(confirmPayload);
            errorMessage(
              `${t(
                `stockmanagement.stockoperation.qtyreceivedfailed`
              )} ${errorToken}`
            );
            return;
          } else {
            successAlert(
              `${t(`stockmanagement.stockoperation.qtyreceivedsuccess`)}`
            );
          }
        })
        .catch((error) => {
          var errorToken = toErrorMessage(error);
          errorMessage(
            `${t(
              `stockmanagement.stockoperation.qtyreceivedfailed`
            )} ${errorToken}`
          );
          return;
        });
      setShowSplash(false);
      hideSplash = false;
    } finally {
      if (hideSplash) {
        setShowSplash(false);
      }
    }
  }, [
    editableModel?.uuid,
    executeStockOperationAction,
    stockOperationItems,
    t,
    validateReceivedItems,
  ]);

  const handleSave = useCallback(async () => {
    setShowSplash(true);
    if (!validateItems()) {
      setShowSplash(false);
      return;
    }
    let hideSplash = true;
    try {
      let stockOperation = getUpdateStockOperationModel();
      await (isNew
        ? createStockOperation(stockOperation)
        : updateStockOperation({
            model: stockOperation,
            uuid: editableModel.uuid!,
          })
      )
        .unwrap()
        .then((payload: any) => {
          if ((payload as any).error) {
            var errorToken = toErrorMessage(payload);
            errorAlert(
              `${t(
                editableModel.uuid == null
                  ? "stockmanagement.stockoperation.createfailed"
                  : "stockmanagement.stockoperation.updatefailed"
              )} ${errorToken}`
            );
            return;
          } else {
            setShowSplash(false);
            hideSplash = false;
            successAlert(
              `${t(
                editableModel.uuid == null
                  ? "stockmanagement.stockoperation.createsuccess"
                  : "stockmanagement.stockoperation.updatesuccess"
              )}`
            );
            if (isNew) {
              navigate(
                URL_STOCK_OPERATION((payload as StockOperationDTO).uuid!)
              );
            } else {
              //setShowSplash(true);
              //window.location.reload();
              navigate(
                URL_STOCK_OPERATIONS_REDIRECT(
                  (payload as StockOperationDTO).uuid!,
                  selectedTab?.toString() ?? ""
                )
              );
            }
          }
        })
        .catch((error) => {
          var errorToken = toErrorMessage(error);
          errorAlert(
            `${t(
              editableModel.uuid == null
                ? "stockmanagement.stockoperation.createfailed"
                : "stockmanagement.stockoperation.updatefailed"
            )} ${errorToken}`
          );
          return;
        });
    } finally {
      if (hideSplash) {
        setShowSplash(false);
      }
    }
  }, [
    validateItems,
    getUpdateStockOperationModel,
    isNew,
    createStockOperation,
    updateStockOperation,
    editableModel.uuid,
    t,
    navigate,
    selectedTab,
  ]);

  const handleBatchInfoSave = useCallback(async () => {
    setShowSplash(true);
    if (!validatItemsBatchInformation()) {
      setShowSplash(false);
      return;
    }
    let hideSplash = true;
    try {
      let stockOperationBatchInfo = getUpdateBatchInfoStockOperationModel();
      if (stockOperationBatchInfo.batchNumbers.length === 0) return;
      await updateStockOperationBatchNumbers({
        model: stockOperationBatchInfo,
        uuid: editableModel.uuid!,
      })
        .unwrap()
        .then((payload: any) => {
          if ((payload as any).error) {
            var errorToken = toErrorMessage(payload);
            errorAlert(
              `${t(
                "stockmanagement.stockoperation.updatebatchinfofailed"
              )} ${errorToken}`
            );
            return;
          } else {
            setShowSplash(false);
            hideSplash = false;
            successAlert(
              `${t("stockmanagement.stockoperation.updatebatchinfosuccess")}`
            );
            navigate(
              URL_STOCK_OPERATIONS_REDIRECT(
                editableModel.uuid!,
                selectedTab?.toString() ?? ""
              )
            );
          }
        })
        .catch((error) => {
          var errorToken = toErrorMessage(error);
          errorAlert(
            `${t(
              "stockmanagement.stockoperation.updatebatchinfofailed"
            )} ${errorToken}`
          );
          return;
        });
    } finally {
      if (hideSplash) {
        setShowSplash(false);
      }
    }
  }, [
    validatItemsBatchInformation,
    getUpdateBatchInfoStockOperationModel,
    updateStockOperationBatchNumbers,
    editableModel.uuid,
    t,
    navigate,
    selectedTab,
  ]);

  const handleGoBack = useCallback(() => {
    setConfirmText("stockmanagement.stockoperation.confirm.back.text");
    setConfirmHeading("stockmanagement.stockoperation.confirm.back.heading");
    setConfirmLabel("stockmanagement.stockoperation.confirm.back.label");
    setConfirmType("back");
    setConfirmDefaultReason("");
    setConfirmRequireReason(false);
    setConfirmParam("");
    setShowConfirm(true);
  }, []);

  const handleCancel = useCallback(() => {
    setConfirmText("stockmanagement.stockoperation.confirm.cancel.text");
    setConfirmHeading("stockmanagement.stockoperation.confirm.cancel.heading");
    setConfirmLabel("stockmanagement.stockoperation.confirm.cancel.label");
    setConfirmType("cancel");
    setConfirmDefaultReason("");
    setConfirmRequireReason(true);
    setConfirmParam("");
    setShowConfirm(true);
  }, []);

  const handleSubmit = useCallback(() => {
    setConfirmText("stockmanagement.stockoperation.confirm.submit.text");
    setConfirmHeading("stockmanagement.stockoperation.confirm.submit.heading");
    setConfirmLabel("stockmanagement.stockoperation.confirm.submit.label");
    setConfirmType("submit");
    setConfirmDefaultReason("");
    setConfirmRequireReason(false);
    setConfirmParam("");
    setShowConfirm(true);
  }, []);

  const handleCompleteDispatch = useCallback(() => {
    setConfirmText("stockmanagement.stockoperation.confirm.complete.text");
    setConfirmHeading(
      "stockmanagement.stockoperation.confirm.complete.heading"
    );
    setConfirmLabel("stockmanagement.stockoperation.confirm.complete.label");
    setConfirmType("completedispatch");
    setConfirmDefaultReason("");
    setConfirmRequireReason(false);
    setConfirmParam("");
    setShowConfirm(true);
  }, []);

  const handleComplete = useCallback(() => {
    setConfirmText("stockmanagement.stockoperation.confirm.complete.text");
    setConfirmHeading(
      "stockmanagement.stockoperation.confirm.complete.heading"
    );
    setConfirmLabel("stockmanagement.stockoperation.confirm.complete.label");
    setConfirmType("complete");
    setConfirmDefaultReason("");
    setConfirmRequireReason(false);
    setConfirmParam("");
    setShowConfirm(true);
  }, []);

  const handleDispatch = useCallback(() => {
    setConfirmText("stockmanagement.stockoperation.confirm.dispatch.text");
    setConfirmHeading(
      "stockmanagement.stockoperation.confirm.dispatch.heading"
    );
    setConfirmLabel("stockmanagement.stockoperation.confirm.dispatch.label");
    setConfirmType("dispatch");
    setConfirmDefaultReason("");
    setConfirmRequireReason(false);
    setConfirmParam("");
    setShowConfirm(true);
  }, []);

  const handleApprovalDispatch = useCallback(() => {
    setConfirmText("stockmanagement.stockoperation.confirm.dispatch.text");
    setConfirmHeading(
      "stockmanagement.stockoperation.confirm.dispatch.heading"
    );
    setConfirmLabel("stockmanagement.stockoperation.confirm.dispatch.label");
    setConfirmType("dispatchapproval");
    setConfirmDefaultReason("");
    setConfirmRequireReason(false);
    setConfirmParam("");
    setShowConfirm(true);
  }, []);

  const handleReturn = useCallback(() => {
    setConfirmText("stockmanagement.stockoperation.confirm.return.text");
    setConfirmHeading("stockmanagement.stockoperation.confirm.return.heading");
    setConfirmLabel("stockmanagement.stockoperation.confirm.return.label");
    setConfirmType("return");
    setConfirmDefaultReason("");
    setConfirmRequireReason(true);
    setConfirmParam("");
    setShowConfirm(true);
  }, []);

  const handleReject = useCallback(() => {
    setConfirmText("stockmanagement.stockoperation.confirm.reject.text");
    setConfirmHeading("stockmanagement.stockoperation.confirm.reject.heading");
    setConfirmLabel("stockmanagement.stockoperation.confirm.reject.label");
    setConfirmType("reject");
    setConfirmDefaultReason("");
    setConfirmRequireReason(true);
    setConfirmParam("");
    setShowConfirm(true);
  }, []);

  const handleApprove = useCallback(() => {
    setConfirmText("stockmanagement.stockoperation.confirm.approve.text");
    setConfirmHeading("stockmanagement.stockoperation.confirm.approve.heading");
    setConfirmLabel("stockmanagement.stockoperation.confirm.approve.label");
    setConfirmType("approve");
    setConfirmDefaultReason("");
    setConfirmRequireReason(false);
    setConfirmParam("");
    setShowConfirm(true);
  }, []);

  const handleRemoveItem = useCallback(
    (itemDto: StockOperationItemDTO) => {
      let text = t("stockmanagement.stockoperation.confirm.removeitem.text");
      text = text.replaceAll("%item.name%", itemDto?.stockItemName ?? "");
      setConfirmText(text);
      setConfirmHeading(
        "stockmanagement.stockoperation.confirm.removeitem.heading"
      );
      setConfirmLabel(itemDto?.stockItemName!);
      setConfirmType("removeitem");
      setConfirmDefaultReason("");
      setConfirmRequireReason(false);
      setConfirmParam(itemDto.uuid ?? "");
      setShowConfirm(true);
    },
    [t]
  );

  const onConfirmRemoveItem = async (
    itemUuid: string | undefined | null
  ): Promise<void> => {
    if (!itemUuid) {
      return;
    }
    setShowSplash(true);
    try {
      await deleteStockOperationItem(itemUuid)
        .unwrap()
        .then((payload: any) => {
          if (payload && (payload as any).error) {
            var errorToken = toErrorMessage(payload);
            errorAlert(
              `${t(
                "stockmanagement.stockoperation.deletefailed"
              )} ${errorToken}`
            );
            return;
          } else {
            successAlert(
              `${t("stockmanagement.stockoperation.deletesuccess")}`
            );
            setStockOperationItems(
              produce((draft) => {
                const itemIndex = draft.findIndex((p) => p.uuid === itemUuid);
                if (itemIndex >= 0) {
                  draft.splice(itemIndex, 1);
                }
              })
            );
          }
        })
        .catch((error) => {
          var errorToken = toErrorMessage(error);
          errorAlert(
            `${t(
              editableModel.uuid == null
                ? "stockmanagement.stockoperation.createfailed"
                : "stockmanagement.stockoperation.updatefailed"
            )} ${errorToken}`
          );
          return;
        });
    } finally {
      setShowSplash(false);
    }
  };

  const onConfirmSubmit = async (
    complete: boolean,
    isDispatch: boolean
  ): Promise<void> => {
    setShowSplash(true);
    let hideSplash = true;
    try {
      let stockOperation = getUpdateStockOperationModel();
      let stockOperationUuid: string | null | undefined = isNew
        ? null
        : editableModel.uuid;
      let saveSuccess = false;
      await (isNew
        ? createStockOperation(stockOperation)
        : updateStockOperation({
            model: stockOperation,
            uuid: editableModel.uuid!,
          })
      )
        .unwrap()
        .then((payload: any) => {
          if ((payload as any).error) {
            var errorToken = toErrorMessage(payload);
            errorAlert(
              `${t(
                editableModel.uuid == null
                  ? "stockmanagement.stockoperation.createfailed"
                  : "stockmanagement.stockoperation.updatefailed"
              )} ${errorToken}`
            );
            return;
          } else {
            saveSuccess = true;
            successAlert(
              `${t(
                editableModel.uuid == null
                  ? "stockmanagement.stockoperation.createsuccess"
                  : "stockmanagement.stockoperation.updatesuccess"
              )}`
            );
            stockOperationUuid = (payload as StockOperationDTO).uuid!;
          }
        })
        .catch((error) => {
          var errorToken = toErrorMessage(error);
          errorAlert(
            `${t(
              editableModel.uuid == null
                ? "stockmanagement.stockoperation.createfailed"
                : "stockmanagement.stockoperation.updatefailed"
            )} ${errorToken}`
          );
          return;
        });

      if (saveSuccess) {
        await executeStockOperationAction({
          name: complete ? "COMPLETE" : isDispatch ? "DISPATCH" : "SUBMIT",
          uuid: stockOperationUuid!,
        })
          .unwrap()
          .then((submitPayload: any) => {
            if (submitPayload && (submitPayload as any).error) {
              var errorToken = toErrorMessage(submitPayload);
              errorMessage(
                `${t(
                  complete
                    ? "stockmanagement.stockoperation.completefailed"
                    : isDispatch
                    ? "stockmanagement.stockoperation.dispatchfailed"
                    : "stockmanagement.stockoperation.submitfailed"
                )} ${errorToken}`
              );
              return;
            } else {
              successAlert(
                `${t(
                  complete
                    ? "stockmanagement.stockoperation.completesuccess"
                    : isDispatch
                    ? "stockmanagement.stockoperation.dispatchsuccess"
                    : "stockmanagement.stockoperation.submitsuccess"
                )}`
              );
            }
          })
          .catch((error) => {
            var errorToken = toErrorMessage(error);
            errorMessage(
              `${t(
                complete
                  ? "stockmanagement.stockoperation.completefailed"
                  : isDispatch
                  ? "stockmanagement.stockoperation.dispatchfailed"
                  : "stockmanagement.stockoperation.submitfailed"
              )} ${errorToken}`
            );
            return;
          });

        setShowSplash(false);
        hideSplash = false;
        if (isNew) {
          navigate(URL_STOCK_OPERATION(stockOperationUuid!));
        } else {
          navigate(
            URL_STOCK_OPERATIONS_REDIRECT(
              stockOperationUuid!,
              selectedTab?.toString() ?? ""
            )
          );
        }
      }
    } finally {
      if (hideSplash) {
        setShowSplash(false);
      }
    }
  };

  const executeOperationAction = async (
    confirmType: string,
    uuid: string,
    reason?: string | null
  ) => {
    setShowSplash(true);
    let hideSplash = true;
    let messagePrefix = confirmType;
    try {
      let actionName: StopOperationActionType | null = null;
      switch (confirmType) {
        case "cancel":
          actionName = "CANCEL";
          break;
        case "reject":
          actionName = "REJECT";
          break;
        case "return":
          actionName = "RETURN";
          break;
        case "approve":
          actionName = "APPROVE";
          break;
        case "dispatchapproval":
          messagePrefix = "dispatch";
          actionName = "DISPATCH";
          break;
      }
      if (!actionName) {
        return;
      }

      await executeStockOperationAction({
        name: actionName,
        uuid: uuid,
        reason: reason,
      })
        .unwrap()
        .then((confirmPayload: any) => {
          if (confirmPayload && (confirmPayload as any).error) {
            var errorToken = toErrorMessage(confirmPayload);
            errorMessage(
              `${t(
                `stockmanagement.stockoperation.${messagePrefix}failed`
              )} ${errorToken}`
            );
            return;
          } else {
            successAlert(
              `${t(`stockmanagement.stockoperation.${messagePrefix}success`)}`
            );
          }
        })
        .catch((error) => {
          var errorToken = toErrorMessage(error);
          errorMessage(
            `${t(
              `stockmanagement.stockoperation.${messagePrefix}failed`
            )} ${errorToken}`
          );
          return;
        });
      setShowSplash(false);
      hideSplash = false;
      navigate(
        URL_STOCK_OPERATIONS_REDIRECT(uuid, selectedTab?.toString() ?? "")
      );
    } finally {
      if (hideSplash) {
        setShowSplash(false);
      }
    }
  };

  const onConfirmAction = (
    confirmType: string,
    reason: string | null,
    confirmParam?: string
  ) => {
    setShowConfirm(false);
    switch (confirmType) {
      case "back":
        navigate(URL_STOCK_OPERATIONS);
        break;
      case "submit":
        onConfirmSubmit(false, false);
        break;
      case "completedispatch":
        completeDispatch();
        break;
      case "complete":
        onConfirmSubmit(true, false);
        break;
      case "dispatch":
        onConfirmSubmit(false, true);
        break;
      case "dispatchapproval":
      case "cancel":
      case "reject":
      case "return":
      case "approve":
        executeOperationAction(confirmType, editableModel?.uuid!, reason);
        break;
      case "removeitem":
        onConfirmRemoveItem(confirmParam);
        break;
    }
  };

  const handleIssueStock = useCallback(() => {
    navigate(
      URL_STOCK_OPERATIONS_NEW_OPERATION(
        STOCK_ISSUE_OPERATION_TYPE,
        editableModel?.uuid!
      )
    );
  }, [editableModel?.uuid, navigate]);

  const onConfirmClose = () => {
    setConfirmDefaultReason("");
    setShowConfirm(false);
  };

  const onPrintStockOperation = async () => {
    setShowSplash(true);
    try {
      let parentOperation: StockOperationDTO | null | undefined;
      let itemsCost: StockOperationItemCost[] | null | undefined = null;
      let itemInventory: StockItemInventory[] | null | undefined = null;

      if (editableModel.requisitionStockOperationUuid) {
        await getStockOperation(
          editableModel.requisitionStockOperationUuid,
          false
        )
          .unwrap()
          .then((payload: any) => {
            if ((payload as any).error) {
              handleErrors(payload);
              return;
            }
            parentOperation = payload;
          })
          .catch((error: any) => {
            handleErrors(error);
            return;
          });
        if (!parentOperation) {
          return null;
        }
      }

      if (
        parentOperation ||
        StockOperationPrintHasItemCosts(editableModel.operationType!) ||
        StockOperationTypeIsTransferOut(editableModel.operationType!)
      ) {
        let enableOperationPrintCosts = !STOCK_OPERATION_PRINT_DISABLE_COSTS;
        if (enableOperationPrintCosts) {
          await getStockOperationItemsCost(editableModel.uuid!, false)
            .unwrap()
            .then((payload: any) => {
              if ((payload as any).error) {
                handleErrors(payload);
                return;
              }
              itemsCost = payload?.results;
            })
            .catch((error: any) => {
              handleErrors(error);
              return;
            });
        }
      }
      let enableBalance = !STOCK_OPERATION_PRINT_DISABLE_BALANCE_ON_HAND;
      if (
        enableBalance &&
        (parentOperation ||
          StockOperationTypeIsRequistion(editableModel.operationType!))
      ) {
        let inventoryFilter: StockItemInventoryFilter = {};
        if (parentOperation?.uuid) {
          inventoryFilter.locationUuid = parentOperation.atLocationUuid;
          inventoryFilter.stockOperationUuid = parentOperation.uuid;
        } else {
          inventoryFilter.locationUuid = editableModel.atLocationUuid;
          inventoryFilter.stockOperationUuid = editableModel.uuid;
        }
        inventoryFilter.v = ResourceRepresentation.Default;
        inventoryFilter.groupBy = "LocationStockItem";
        inventoryFilter.includeStockItemName = "true";

        inventoryFilter.date = JSON.stringify(
          parentOperation?.dateCreated ?? editableModel?.dateCreated
        ).replaceAll('"', "");
        await getStockItemInventory(inventoryFilter)
          .unwrap()
          .then((payload: any) => {
            if ((payload as any).error) {
              handleErrors(payload);
              return;
            }
            itemInventory = payload?.results;
          })
          .catch((error: any) => {
            handleErrors(error);
            return;
          });
      }

      let data = await BuildStockOperationData(
        editableModel,
        stockOperationItems,
        parentOperation!,
        itemsCost,
        itemInventory
      );
      if (data) {
        if (StockOperationTypeIsReceipt(editableModel?.operationType!)) {
          await PrintGoodsReceivedNoteStockOperation(data);
        } else if (
          StockOperationTypeIsTransferOut(editableModel?.operationType!)
        ) {
          await PrintTransferOutStockOperation(data);
        } else {
          await PrintRequisitionStockOperation(data);
        }
      } else {
        console.log(data);
      }
    } catch (e) {
      console.log(e);
    } finally {
      setShowSplash(false);
    }
  };

  if (showLoading) {
    return <AccordionSkeleton open count={4} />;
  }

  return (
    <>
      <Splash active={showSplash} blockUi={true} />
      {showConfirm && (
        <ConfirmModalPopup
          showModal={showConfirm}
          confirmHeading={confirmHeading}
          confirmLabel={confirmLabel}
          confirmText={confirmText}
          confirmType={confirmType}
          onConfirm={onConfirmAction}
          onClose={onConfirmClose}
          defaultReason={confirmDefaultReason}
          requireReason={confirmRequireReason}
          confirmParam={confirmParam}
        />
      )}
      <div className="stkpg-page">
        <div className="stkpg-page-body stkpg-clear-overflow skpg-tab-panel-no-horiz-padding">
          {
            <div
              className={`stkpg-operation-approval ${
                !canEdit &&
                !canApprove &&
                !canReceiveItems &&
                !isRequisitionAndCanIssueStock &&
                !canPrint
                  ? "stkpg-operation-approval-hide"
                  : ""
              }`}
            >
              <div className="edit-expand-display-fields">
                {editableModel?.status && (
                  <div className="field-label operation-status">
                    <span className="field-title">
                      {t("stockmanagement.status")}:
                    </span>
                    <span className={`field-desc ${editableModel?.status}`}>
                      {editableModel?.status}
                    </span>
                  </div>
                )}
                {editableModel?.dateCreated && (
                  <div className="field-label">
                    <span className="field-title">
                      {t("stockmanagement.started")}:
                    </span>
                    <span className="field-desc">
                      <span className="action-date">
                        {formatDisplayDateTime(editableModel?.dateCreated)}
                      </span>{" "}
                      {t("stockmanagement.by")}{" "}
                      <span className="action-by">
                        {editableModel.creatorFamilyName ?? ""}{" "}
                        {editableModel.creatorGivenName ?? ""}
                      </span>
                    </span>
                  </div>
                )}
                {editableModel?.status !== StockOperationStatusNew &&
                  editableModel?.status !== StockOperationStatusReturned &&
                  editableModel?.submittedDate && (
                    <div className="field-label">
                      <span className="field-title">
                        {t("stockmanagement.submitted")}:
                      </span>
                      <span className="field-desc">
                        <span className="action-date">
                          {formatDisplayDateTime(editableModel?.submittedDate)}
                        </span>{" "}
                        {t("stockmanagement.by")}{" "}
                        <span className="action-by">
                          {editableModel.submittedByFamilyName ?? ""}{" "}
                          {editableModel.submittedByGivenName ?? ""}
                        </span>
                      </span>
                    </div>
                  )}

                {editableModel?.dispatchedDate && (
                  <div className="field-label">
                    <span className="field-title">
                      {t("stockmanagement.dispatched")}:
                    </span>
                    <span className="field-desc">
                      <span className="action-date">
                        {formatDisplayDateTime(editableModel?.dispatchedDate)}
                      </span>{" "}
                      {t("stockmanagement.by")}{" "}
                      <span className="action-by">
                        {editableModel.dispatchedByFamilyName ?? ""}{" "}
                        {editableModel.dispatchedByGivenName ?? ""}
                      </span>
                    </span>
                  </div>
                )}
                {editableModel?.status === StockOperationStatusReturned && (
                  <div className="field-label">
                    <span className="field-title">
                      {t("stockmanagement.returned")}:
                    </span>
                    <span className="field-desc">
                      <span className="action-date">
                        {formatDisplayDateTime(editableModel?.returnedDate)}
                      </span>{" "}
                      {t("stockmanagement.by")}{" "}
                      <span className="action-by">
                        {editableModel.returnedByFamilyName ?? ""}{" "}
                        {editableModel.returnedByGivenName ?? ""}
                      </span>
                      <p>{editableModel.returnReason}</p>
                    </span>
                  </div>
                )}

                {editableModel?.completedDate && (
                  <div className="field-label">
                    <span className="field-title">
                      {t("stockmanagement.completed")}:
                    </span>
                    <span className="field-desc">
                      <span className="action-date">
                        {formatDisplayDateTime(editableModel?.completedDate)}
                      </span>{" "}
                      {t("stockmanagement.by")}{" "}
                      <span className="action-by">
                        {editableModel.completedByFamilyName ?? ""}{" "}
                        {editableModel.completedByGivenName ?? ""}
                      </span>
                    </span>
                  </div>
                )}

                {editableModel?.status === StockOperationStatusCancelled && (
                  <div className="field-label">
                    <span className="field-title">
                      {t("stockmanagement.cancelled")}:
                    </span>
                    <span className="field-desc">
                      <span className="action-date">
                        {formatDisplayDateTime(editableModel?.cancelledDate)}
                      </span>{" "}
                      {t("stockmanagement.by")}{" "}
                      <span className="action-by">
                        {editableModel.cancelledByFamilyName ?? ""}{" "}
                        {editableModel.cancelledByGivenName ?? ""}
                      </span>
                      <p>{editableModel.cancelReason}</p>
                    </span>
                  </div>
                )}

                {editableModel?.status === StockOperationStatusRejected && (
                  <div className="field-label">
                    <span className="field-title">
                      {t("stockmanagement.rejected")}:
                    </span>
                    <span className="field-desc">
                      <span className="action-date">
                        {formatDisplayDateTime(editableModel?.rejectedDate)}
                      </span>{" "}
                      {t("stockmanagement.by")}{" "}
                      <span className="action-by">
                        {editableModel.rejectedByFamilyName ?? ""}{" "}
                        {editableModel.rejectedByGivenName ?? ""}
                      </span>
                      <p>{editableModel.rejectionReason}</p>
                    </span>
                  </div>
                )}
              </div>
              {((!canEdit && (canApprove || canReceiveItems)) ||
                (!isNew && (canEdit || canPrint)) ||
                isRequisitionAndCanIssueStock) && (
                <div className="right-actions">
                  {!canEdit && canApprove && (
                    <>
                      {!requiresDispatchAcknowledgement && (
                        <Button
                          name="approve"
                          type="submit"
                          size="sm"
                          className="submitButton"
                          onClick={handleApprove}
                          kind="primary"
                          renderIcon={CheckmarkOutline24}
                        >
                          {t("stockmanagement.approve")}
                        </Button>
                      )}
                      {requiresDispatchAcknowledgement && (
                        <Button
                          name="approveDispatch"
                          type="submit"
                          size="sm"
                          className="submitButton"
                          onClick={handleApprovalDispatch}
                          kind="primary"
                          renderIcon={Departure24}
                        >
                          {t("stockmanagement.dispatch")}
                        </Button>
                      )}
                      <Button
                        name="reject"
                        type="submit"
                        size="sm"
                        className="submitButton"
                        onClick={handleReject}
                        kind="danger--primary"
                        renderIcon={CloseOutline24}
                      >
                        {t("stockmanagement.reject")}
                      </Button>
                      <Button
                        name="return"
                        type="button"
                        size="sm"
                        className="cancelButton"
                        kind="tertiary"
                        onClick={handleReturn}
                        renderIcon={Repeat24}
                      >
                        {t("stockmanagement.return")}
                      </Button>
                      <Button
                        name="cancel"
                        type="button"
                        size="sm"
                        className="cancelButton"
                        kind="danger--ghost"
                        onClick={handleCancel}
                        renderIcon={Error24}
                      >
                        {t("stockmanagement.canceltransaction")}
                      </Button>
                    </>
                  )}
                  {!canEdit && canReceiveItems && (
                    <>
                      <Button
                        name="completedispatch"
                        type="submit"
                        size="sm"
                        className="submitButton"
                        onClick={handleCompleteDispatch}
                        kind="primary"
                        renderIcon={Arrival24}
                      >
                        {t("stockmanagement.stockoperation.edit.complete")}
                      </Button>
                      <Button
                        name="return"
                        type="button"
                        size="sm"
                        className="cancelButton"
                        kind="tertiary"
                        onClick={handleReturn}
                        renderIcon={Repeat24}
                      >
                        {t("stockmanagement.return")}
                      </Button>
                    </>
                  )}
                  {!isNew && canEdit && (
                    <Button
                      type="button"
                      size="sm"
                      className="cancelButton"
                      kind="danger--tertiary"
                      onClick={handleCancel}
                      renderIcon={Error24}
                    >
                      {t("stockmanagement.canceltransaction")}
                    </Button>
                  )}
                  {isRequisitionAndCanIssueStock && (
                    <>
                      <Button
                        type="button"
                        size="sm"
                        className="cancelButton"
                        kind="tertiary"
                        onClick={handleIssueStock}
                        renderIcon={DeliveryTruck24}
                      >
                        {t("stockmanagement.issuestock")}
                      </Button>
                    </>
                  )}
                  {!isNew && canPrint && (
                    <>
                      <Button
                        type="button"
                        size="sm"
                        className="cancelButton"
                        iconDescription={"Print"}
                        kind="ghost"
                        renderIcon={Printer24}
                        onClick={onPrintStockOperation}
                      >
                        {t("stockmanagement.print")}
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>
          }
          {fetchedStockOperationLinks &&
            stockOperationLinks &&
            stockOperationLinks.results?.length > 0 && (
              <div className="stkpg-rel-ops">
                <h6>Related Transactions:</h6>
                {stockOperationLinks.results?.map((p) => (
                  <div key={p.uuid} className="stkpg-rel-op-item">
                    {(editableModel?.uuid === p.parentUuid ||
                      requisitionUuid === p.parentUuid) && (
                      <>
                        <span>{p.childOperationTypeName}</span>
                        <span className={p.childVoided ? "voided" : ""}>
                          {p.childVoided && p.childOperationNumber}
                          {!p.childVoided && (
                            <Link
                              target={"_blank"}
                              to={URL_STOCK_OPERATION(p.childUuid)}
                            >
                              {p.childOperationNumber}
                            </Link>
                          )}
                        </span>
                        <span>[{p.childStatus}]</span>
                        <OverflowMenuVertical24 />
                      </>
                    )}
                    {(editableModel?.uuid === p.childUuid ||
                      requisitionUuid === p.childUuid) && (
                      <>
                        <span>{p.parentOperationTypeName}</span>
                        <span className={p.parentVoided ? "voided" : ""}>
                          {p.parentVoided && p.parentOperationNumber}
                          {!p.parentVoided && (
                            <Link
                              target={"_blank"}
                              to={URL_STOCK_OPERATION(p.parentUuid)}
                            >
                              {p.parentOperationNumber}
                            </Link>
                          )}
                        </span>
                        <span>[{p.parentStatus}]</span>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}

          <Tabs
            selected={selectedTab}
            type="container"
            onSelectionChange={(e) => setSelectedTab(e)}
          >
            <Tab label={`${stockOperationType?.name ?? ""} Details`}>
              <EditStockOperation
                model={editableModel!}
                setModel={setEditableMode}
                isNew={isNew}
                setShowSplash={setShowSplash}
                setSelectedTab={setSelectedTab}
                hasItems={hasItems}
                locked={editableModel?.locked ?? false}
                canEdit={canEdit}
                setShowItems={setShowItems}
                currentStockOperationType={stockOperationType}
                sourcePartyList={sourcePartyList}
                lockSource={lockSource}
                destinationPartyList={destinationPartyList}
                lockDestination={lockDestination}
                actions={{ onSave: handleSave, onGoBack: handleGoBack }}
                requireStockAdjustmentReason={requireStockAdjustmentReason}
                atLocation={atLocation}
                setAtLocation={setAtLocation}
                setBatchBalance={setBatchBalance}
              />
            </Tab>
            <Tab label="Stock Items" disabled={!showItems}>
              <StockOperationItemsTable
                setStockOperationItems={setStockOperationItems}
                addItem={addNewStockOperationItem}
                items={stockOperationItems}
                canEdit={canEdit}
                setShowComplete={setShowComplete}
                isNegativeQtyAllowed={isNegativeQtyAllowed}
                locked={editableModel?.locked ?? false}
                requiresBatchUuid={requiresBatchUuid}
                requiresActualBatchInformation={requiresActualBatchInformation}
                isQuantityOptional={isQuantityOptional}
                canCapturePurchasePrice={canCapturePurchasePrice}
                setSelectedTab={setSelectedTab}
                actions={{
                  onSave: handleSave,
                  onGoBack: handleGoBack,
                  onRemoveItem: handleRemoveItem,
                  onBatchInfoSave: handleBatchInfoSave,
                }}
                errors={itemValidity}
                setItemValidity={setItemValidity}
                validateItems={validateItems}
                showQuantityRequested={showQuantityRequested}
                allowExpiredBatchNumbers={allowExpiredBatchNumbers}
                canUpdateBatchInformation={canUpdateBatchInformation}
                atLocation={atLocation}
                batchBalance={batchBalance}
                setBatchBalance={setBatchBalance}
              />
            </Tab>
            <Tab
              label={
                requiresDispatchAcknowledgement
                  ? "Submit/Dispatch"
                  : "Submit/Complete"
              }
              disabled={!showItems || !showComplete}
            >
              <SubmitApproval
                model={editableModel!}
                setModel={setEditableMode}
                canEdit={canEdit}
                requiresDispatchAcknowledgement={
                  requiresDispatchAcknowledgement
                }
                locked={editableModel?.locked ?? false}
                currentStockOperationType={stockOperationType}
                isNew={isNew}
                actions={{
                  onSave: handleSave,
                  onGoBack: handleGoBack,
                  onComplete: handleComplete,
                  onSubmit: handleSubmit,
                  onDispatch: handleDispatch,
                }}
              />
            </Tab>
            {canDisplayReceivedItems && (
              <Tab
                label={"Received Items"}
                disabled={!showItems || !showComplete}
              >
                <ReceiveItemsTable
                  setStockOperationItems={setStockOperationItems}
                  items={stockOperationItems}
                  canReceiveItems={canReceiveItems}
                  isNegativeQtyAllowed={isNegativeQtyAllowed}
                  locked={editableModel?.locked ?? false}
                  actions={{
                    onGoBack: handleGoBack,
                    onSaveReceivedItems: handleSaveReceivedItems,
                  }}
                  errors={receivedItemValidity}
                  setItemValidity={setReceivedItemValidity}
                  validateReceivedItems={validateItems}
                />
              </Tab>
            )}
          </Tabs>
        </div>
      </div>
    </>
  );
};
