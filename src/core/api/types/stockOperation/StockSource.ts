import { BaseOpenmrsData } from "../BaseOpenmrsData";
import { Concept } from "../concept/Concept";

export interface StockSource extends BaseOpenmrsData {
  name: string;
  acronym: string;
  sourceType: Concept | undefined;
}
