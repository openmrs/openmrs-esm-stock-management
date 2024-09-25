import { BaseOpenmrsMetadata } from '../BaseOpenmrsMetadata';
import { Concept } from './Concept';

export interface Drug extends BaseOpenmrsMetadata {
  drugId: number;
  display: string;
  combination: boolean;
  dosageForm: Concept;
  maximumDailyDose: number;
  minimumDailyDose: number;
  strength: string;
  concept: Concept;
  displayName: string;
}
