import { BaseOpenmrsData } from '../BaseOpenmrsData';
import { Patient } from '../identity/Patient';
import { OpenMRSLocation } from '../Location';
import { User } from '../identity/User';
import { StockOperationItem } from './StockOperationItem';
import { StockOperationStatus } from './StockOperationStatus';
import { StockOperationType } from './StockOperationType';
import { Concept } from '../concept/Concept';

export interface StockOperation extends BaseOpenmrsData {
  cancelReason: string;
  cancelledBy: User;
  cancelledDate: Date;
  completedBy: User;
  completedDate: Date;
  destination: OpenMRSLocation;
  externalReference: string;
  location: OpenMRSLocation;
  operationDate: Date;
  locked: boolean;
  operationNumber: string;
  operationOrder: number;
  patient: Patient;
  remarks: string;
  source: OpenMRSLocation;
  sourceOther: string;
  status: StockOperationStatus;
  returnReason: string;
  rejectionReason: string;
  workflowId: number;
  responsiblePerson: User;
  responsiblePersonOther: string;
  consignmentCategory: Concept;
  stockOperationType: StockOperationType;
  stockOperationItems: StockOperationItem[];
}
