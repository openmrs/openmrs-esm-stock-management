import { Type } from '@openmrs/esm-framework';
export const configSchema = {
  printItemCost: {
    type: Type.Boolean,
    _default: false,
    _description: 'Whether to print item costs on the print out',
  },
  enablePrintButton: {
    _type: Type.Boolean,
    _default: true,
    _description: 'Enable or disable the print button in the stock management UI',
  },
  autoPopulateResponsiblePerson: {
    type: Type.Boolean,
    _default: false,
    _description: 'Auto populate responsible person in stock operations with the currently logged in user',
  },
  printBalanceOnHand: {
    type: Type.Boolean,
    _default: false,
    _description: 'Whether to print balance on hand on the print out',
  },
  packagingUnitsUUID: {
    _type: Type.ConceptUuid,
    _description: 'UUID for the packaging unit',
    _default: 'bce2b1af-98b1-48a2-98a2-3e4ffb3c79c2',
  },
  stockAdjustmentReasonUUID: {
    _type: Type.ConceptUuid,
    _description: 'UUID for the stock adjustment reasons',
    _default: '47f0825e-8648-47c2-b847-d3197ed6bb72',
  },
  stockTakeReasonUUID: {
    _type: Type.ConceptUuid,
    _description: 'UUID for the stock take reasons',
    _default: '47f0825e-8648-47c2-b847-d3197ed6bb72',
  },
  stockSourceTypeUUID: {
    _type: Type.ConceptUuid,
    _description: 'UUID for the stock source types',
    _default: '2e1e8049-9cbe-4a2d-b1e5-8a91e5d7d97d',
  },
  dispensingUnitsUUID: {
    _type: Type.ConceptUuid,
    _description: 'UUID for the stock dispensing units uuid',
    _default: '162402AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  },
  useItemCommonNameAsDisplay: {
    _type: Type.Boolean,
    _description: 'true to use item common name as display and false to use Drug name as display',
    _default: true,
  },
  stockItemCategoryUUID: {
    _type: Type.ConceptUuid,
    _description: 'UUID for the stock item category',
    _default: '6d24eb6e-b42f-4706-ab2d-ae4472161f6a',
  },
  logo: {
    src: {
      _type: Type.String,
      _default: null,
      _description: 'A path or URL to an image.',
    },
    alt: {
      _type: Type.String,
      _default: 'Logo',
      _description: 'Alt text, shown on hover',
    },
    name: {
      _type: Type.String,
      _default: null,
      _description: 'The organization name displayed when image is absent',
    },
  },
};

export type ConfigObject = {
  autoPopulateResponsiblePerson: boolean;
  enablePrintButton: boolean;
  printItemCost: boolean;
  printBalanceOnHand: boolean;
  packagingUnitsUUID: string;
  stockAdjustmentReasonUUID: string;
  stockSourceTypeUUID: string;
  dispensingUnitsUUID: string;
  stockItemCategoryUUID: string;
  useItemCommonNameAsDisplay: boolean;
  logo: {
    src: string;
    alt: string;
    name: string;
  };
  stockTakeReasonUUID;
};
