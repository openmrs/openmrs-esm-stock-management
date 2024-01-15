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
};

export type Config = {
  printItemCost: boolean;
  printBalanceOnHand: boolean;
};
