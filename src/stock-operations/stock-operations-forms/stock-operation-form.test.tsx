import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { useConfig, useSession } from '@openmrs/esm-framework';
import { mockWorkspace2Props, stockIssueOperationtypeMock } from '@mocks';
import { type StockOperationDTO } from '../../core/api/types/stockOperation/StockOperationDTO';
import { type StockOperationType } from '../../core/api/types/stockOperation/StockOperationType';
import { useStockOperationAndItems } from '../stock-operations.resource';
import useParties from './hooks/useParties';
import StockOperationForm from './stock-operation-form.component';

const mockUseStockOperationAndItems = vi.mocked(useStockOperationAndItems);
const mockUseParties = vi.mocked(useParties);
const mockUseConfig = vi.mocked(useConfig);
const mockUseSession = vi.mocked(useSession);

vi.mock('../../stock-lookups/stock-lookups.resource', () => ({
  useStockOperationTypes: vi.fn().mockReturnValue({ types: { results: [] }, isLoading: false, error: null }),
  useUsers: vi.fn().mockReturnValue({ items: { results: [] }, isLoading: false }),
  useUser: vi.fn().mockReturnValue({ data: { display: 'Test User' }, isLoading: false, error: null }),
  useConcept: vi.fn().mockReturnValue({ items: { answers: [] }, isLoading: false, error: null }),
}));

vi.mock('../stock-operations.resource', () => ({
  getStockOperationLinks: vi.fn(),
  operationStatusColor: vi.fn(() => 'some-color'),
  useStockOperations: vi.fn().mockReturnValue({ items: { results: [] }, isLoading: false, error: null }),
  useStockOperation: vi.fn().mockReturnValue({ items: undefined, isLoading: false, error: null }),
  useStockOperationAndItems: vi.fn(),
}));

vi.mock('./hooks/useParties', () => ({
  default: vi.fn(),
  useParties: vi.fn(),
}));

const requisitionUuid = 'requisition-uuid';
const stockIssueType = stockIssueOperationtypeMock as unknown as StockOperationType;

const requisition = {
  uuid: requisitionUuid,
  sourceUuid: 'main-pharmacy-uuid',
  destinationUuid: 'main-store-uuid',
  responsiblePersonUuid: 'requisition-person-uuid',
  stockOperationItems: [],
} as StockOperationDTO;

const savedIssue = {
  uuid: 'issue-uuid',
  operationTypeUuid: stockIssueOperationtypeMock.uuid,
  operationType: 'stockissue',
  status: 'NEW',
  sourceUuid: 'main-store-uuid',
  destinationUuid: 'main-pharmacy-uuid',
  responsiblePersonUuid: 'issuer-person-uuid',
  remarks: 'Issue remarks',
  requisitionStockOperationUuid: requisitionUuid,
  stockOperationItems: [],
} as StockOperationDTO;

describe('StockOperationForm with a linked requisition', () => {
  beforeEach(() => {
    mockUseStockOperationAndItems.mockImplementation((uuid) => ({
      items: uuid === requisitionUuid ? requisition : undefined,
      isLoading: false,
      error: null,
    }));
    mockUseParties.mockReturnValue({
      destinationParties: [],
      destinationPartiesFilter: () => true,
      destinationTags: [],
      error: undefined,
      isLoading: false,
      mutate: vi.fn(),
      parties: [],
      sourceParties: [],
      sourcePartiesFilter: () => true,
      sourceTags: [],
    });
    mockUseConfig.mockReturnValue({ autoPopulateResponsiblePerson: false });
    mockUseSession.mockReturnValue({
      authenticated: true,
      sessionId: 'test-session-id',
      user: { uuid: 'test-user-uuid' },
    } as ReturnType<typeof useSession>);
  });

  it("shows a saved issue's own details instead of the requisition's", () => {
    render(
      <StockOperationForm
        {...mockWorkspace2Props({
          stockOperationType: stockIssueType,
          stockOperation: savedIssue,
          stockRequisitionUuid: requisitionUuid,
        })}
      />,
    );

    expect(mockUseStockOperationAndItems).not.toHaveBeenCalledWith(requisitionUuid);
  });

  it('prefills a new issue from the requisition', () => {
    render(
      <StockOperationForm
        {...mockWorkspace2Props({
          stockOperationType: stockIssueType,
          stockRequisitionUuid: requisitionUuid,
        })}
      />,
    );

    expect(mockUseStockOperationAndItems).toHaveBeenCalledWith(requisitionUuid);
  });
});
