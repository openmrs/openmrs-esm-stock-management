import React from 'react';
import { render, waitFor, screen, fireEvent } from '@testing-library/react';
import { showSnackbar } from '@openmrs/esm-framework';
import AddStockOperation from '../add-stock-operation/add-stock-operation.component';
import { useInitializeStockOperations } from '../add-stock-operation/add-stock-operation.resource';
import { useStockOperationTypes } from '../../stock-lookups/stock-lookups.resource';
import { getStockOperationLinks } from '../stock-operations.resource';
import { StockOperationDTO } from '../../core/api/types/stockOperation/StockOperationDTO';
import { StockOperationType } from '../../core/api/types/stockOperation/StockOperationType';
import { InitializeResult } from '../add-stock-operation/types';
import { useStockOperations } from '../stock-operations.resource';
import { closeOverlay } from '../../core/components/overlay/hook';

jest.mock('react-i18next', () => ({
  useTranslation: jest.fn().mockReturnValue({ t: (key) => key }),
}));

jest.mock('@openmrs/esm-framework', () => ({
  ActionMenu: jest.fn(() => null),
  showSnackbar: jest.fn(),
  useDebounce: jest.fn((x) => x),
  getGlobalStore: jest.fn(() => ({
    getState: jest.fn(),
    subscribe: jest.fn(),
    setState: jest.fn(),
  })),
  parseDate: jest.fn((date) => new Date(date)),
  showNotification: jest.fn(),
  usePagination: jest.fn(() => ({ currentPage: 1, setPage: jest.fn() })),
  useSession: jest.fn(() => ({ user: { display: 'Test User' } })),
}));

jest.mock('./add-stock-operation.resource', () => ({
  useInitializeStockOperations: jest.fn(),
}));

jest.mock('../../stock-lookups/stock-lookups.resource', () => ({
  useStockOperationTypes: jest.fn(),
  useUsers: jest.fn().mockReturnValue({ items: { results: [] }, isLoading: false }),
}));

jest.mock('../stock-operations.resource', () => ({
  operationStatusColor: jest.fn(() => 'some-color'),
  getStockOperationLinks: jest.fn(),
  useStockOperations: jest.fn().mockReturnValue({
    items: { results: [] },
    isLoading: false,
    error: null,
  }),
}));

jest.mock('../../core/components/overlay/hook', () => ({
  closeOverlay: jest.fn(),
}));

jest.mock('../../stock-items/stock-items.resource', () => ({
  useStockItems: jest.fn().mockReturnValue({
    isLoading: false,
    error: null,
    items: {
      results: [{ uuid: 'mock-uuid', packagingUomName: 'Mock Unit', factor: 1 }],
    },
  }),
  useStockItem: jest.fn(),
}));

const mockOnGoBack = jest.fn();
const mockOnSave = jest.fn();
const mockOnComplete = jest.fn();
const mockOnSubmit = jest.fn();
const mockOnDispatch = jest.fn();

const mockProps = {
  stockOperations: { results: [] },
  uuid: 'some-mock-uuid',
  isEditing: false,
  canPrint: false,
  canEdit: true,
  locked: false,
  model: {
    approvalRequired: null,
    uuid: 'mock-uuid',
    operationType: 'mock-operation-type',
    status: 'COMPLETED',
    dateCreated: '2023-01-01',
    creatorFamilyName: 'Doe',
    creatorGivenName: 'John',
  } as unknown as StockOperationDTO,
  operation: {
    name: 'Stock Issue',
    description: 'Issuing stock',
    operationType: 'stockissue',
    hasSource: true,
    sourceType: {},
    hasDestination: true,
    destinationType: {},
    hasRecipient: false,
    recipientRequired: false,
    availableWhenReserved: false,
    allowExpiredBatchNumbers: false,
    stockOperationTypeLocationScopes: [],
  } as StockOperationType,
  setup: {
    isNegativeQuantityAllowed: false,
    requiresBatchUuid: false,
    requiresActualBatchInfo: false,
    isQuantityOptional: false,
  } as InitializeResult,
  actions: {
    onGoBack: mockOnGoBack,
    onSave: mockOnSave,
    onComplete: mockOnComplete,
    onSubmit: mockOnSubmit,
    onDispatch: mockOnDispatch,
  },
  dto: {
    results: [],
  },
};

describe('AddStockOperation', () => {
  beforeEach(() => {
    const mockStockOperationTypes = { results: [] };
    (useStockOperationTypes as jest.Mock).mockReturnValue(mockStockOperationTypes);
    (getStockOperationLinks as jest.Mock).mockResolvedValue({ data: { results: [] } });
    (useStockOperations as jest.Mock).mockReturnValue({ items: { results: [] }, isLoading: false, error: null });
  });

  it('displays error state correctly', async () => {
    (useInitializeStockOperations as jest.Mock).mockReturnValue({
      isLoading: false,
      error: true,
      result: null,
    });
    const { result } = useInitializeStockOperations(mockProps);
    if (!result) {
      return null;
    }
    render(<AddStockOperation {...mockProps} />);
    expect(showSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: 'error',
        title: 'error',
      }),
    );
  });

  it('displays loading state correctly', async () => {
    (useInitializeStockOperations as jest.Mock).mockReturnValue({
      isLoading: true,
      error: null,
      result: null,
    });
    render(<AddStockOperation {...mockProps} />);
    expect(showSnackbar).not.toHaveBeenCalled();
  });

  it('displays error state and shows snackbar', () => {
    (useInitializeStockOperations as jest.Mock).mockReturnValue({ isLoading: false, error: true, result: null });
    render(<AddStockOperation {...mockProps} />);
    expect(showSnackbar).toHaveBeenCalledWith(expect.objectContaining({ kind: 'error' }));
  });

  it('calls external utilities correctly', async () => {
    (useInitializeStockOperations as jest.Mock).mockReturnValue({
      isLoading: false,
      error: true,
      result: null,
    });

    render(<AddStockOperation {...mockProps} />);
    await waitFor(() => {
      expect(closeOverlay).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(showSnackbar).toHaveBeenCalledWith(
        expect.objectContaining({
          kind: 'error',
          title: 'error',
        }),
      );
    });
  });
});
