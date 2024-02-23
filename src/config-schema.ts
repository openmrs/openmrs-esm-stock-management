import { Type } from "@openmrs/esm-framework";
export const configSchema = {
  printItemCost: {
    type: Type.Boolean,
    _default: false,
    _description: "Whether to print item costs on the print out",
  },
  printBalanceOnHand: {
    type: Type.Boolean,
    _default: false,
    _description: "Whether to print balance on hand on the print out",
  },
  packagingUnitsUUID: {
    _type: Type.ConceptUuid,
    _description: "UUID for the packaging unit",
    _default: "bce2b1af-98b1-48a2-98a2-3e4ffb3c79c2",
  },
  stockAdjustmentReasonUUID: {
    _type: Type.ConceptUuid,
    _description: "UUID for the stock adjustment reasons",
    _default: "3bbfaa44-d5b8-404d-b4c1-2bf49ad8ce25",
  },
  stockSourceTypeUUID: {
    _type: Type.ConceptUuid,
    _description: "UUID for the stock source types",
    _default: "2e1e8049-9cbe-4a2d-b1e5-8a91e5d7d97d",
  },
  dispensingUnitsUUID: {
    _type: Type.ConceptUuid,
    _description: "UUID for the stock dispensing units uuid",
    _default: "162402AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
  },
  stockItemCategoryUUID: {
    _type: Type.ConceptUuid,
    _description: "UUID for the stock item category",
    _default: "6d24eb6e-b42f-4706-ab2d-ae4472161f6a",
  },
};

export type ConfigObject = {
  printItemCost: boolean;
  printBalanceOnHand: boolean;
  packagingUnitsUUID: string;
  stockAdjustmentReasonUUID: string;
  stockSourceTypeUUID: string;
  dispensingUnitsUUID: string;
  stockItemCategoryUUID: string;
};
