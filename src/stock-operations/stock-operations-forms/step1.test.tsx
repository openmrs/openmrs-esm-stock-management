import { useConfig } from '@openmrs/esm-framework';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { StockOperationType } from '../../core/api/types/stockOperation/StockOperationType';
import { useStockOperationTypes } from '../../stock-lookups/stock-lookups.resource';
import { useStockOperations } from '../stock-operations.resource';
import useParties from './hooks/useParties';
import StockOperationForm from './stock-operation-form.component';
import { MAIN_STORE_LOCATION_TAG } from '../../constants';
import {
  adjustmentOpeationTypeMock,
  disposalOperationTypeMock,
  openingStockOperationTypeMock,
  receiptOperationTypeMock,
  requisitionOperationTypeMock,
  returnOperationTypeMock,
  stockIssueOperationtypeMock,
  stockTakeOperationTypeMock,
  tranferOutOperationTypeMock,
} from '../../../__mocks__';
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
  useConfig: jest.fn(),
  ErrorState: jest.fn(({ error }: { error: any }) => <div>{error}</div>),
  launchWorkspace: jest.fn(),
}));

jest.mock('../../stock-lookups/stock-lookups.resource', () => ({
  useStockOperationTypes: jest.fn(),
  useUsers: jest.fn().mockReturnValue({ items: { results: [] }, isLoading: false }),
  useUser: jest.fn().mockReturnValue({ data: { display: 'Test User' }, isLoading: false, error: null }),
  useConcept: jest.fn().mockReturnValue({ items: { answers: [] }, isLoading: false, error: null }),
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

jest.mock('./hooks/useParties', () => jest.fn());

describe('Stock Operation step 1 (baseoperation details)', () => {
  beforeEach(() => {
    const mockStockOperationTypes = { results: [] };
    (useStockOperationTypes as jest.Mock).mockReturnValue(mockStockOperationTypes);
    (useStockOperations as jest.Mock).mockReturnValue({ items: { results: [] }, isLoading: false, error: null });
    (useConfig as jest.Mock).mockReturnValue({ autoPopulateResponsiblePerson: true });
  });

  it('should render loading state when loading  parties info', async () => {
    (useParties as jest.Mock).mockReturnValue({
      destinationParties: [],
      sourceParties: [],
      isLoading: true,
      error: null,
      sourceTags: [],
      destinationTags: [],
    });
    render(<StockOperationForm stockOperationType={receiptOperationTypeMock as any} />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should render error state when parties loading fails', async () => {
    (useParties as jest.Mock).mockReturnValue({
      destinationParties: [],
      sourceParties: [],
      isLoading: false,
      error: 'error',
      sourceTags: [],
      destinationTags: [],
    });
    render(<StockOperationForm stockOperationType={receiptOperationTypeMock as any} />);
    expect(screen.getByText('error')).toBeInTheDocument();
  });

  it('should have only next btn and not previous btn', async () => {
    (useParties as jest.Mock).mockReturnValue({
      destinationParties: [],
      sourceParties: [],
      isLoading: false,
      error: undefined,
      sourceTags: [],
      destinationTags: [],
    });
    render(<StockOperationForm stockOperationType={receiptOperationTypeMock as any} />);
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /previous/i })).not.toBeInTheDocument();
  });
  it('should render operation type in title', async () => {
    (useParties as jest.Mock).mockReturnValue({
      destinationParties: [],
      sourceParties: [],
      isLoading: false,
      error: undefined,
      sourceTags: [],
      destinationTags: [],
    });
    render(<StockOperationForm stockOperationType={receiptOperationTypeMock as any} />);
    expect(screen.getByText(`${receiptOperationTypeMock.name} details`)).toBeInTheDocument();
  });

  it("should render combobox with 'from' name and 'chooseAsource' placeholder for receipt operation", async () => {
    (useParties as jest.Mock).mockReturnValue({
      destinationParties: [],
      sourceParties: [],
      isLoading: false,
      error: undefined,
      sourceTags: [],
      destinationTags: [],
    });
    render(<StockOperationForm stockOperationType={receiptOperationTypeMock as any} />);
    const sourceInput = screen.getByRole('combobox', {
      name: (_, element) =>
        element.getAttribute('placeholder') === 'chooseASource' && element.getAttribute('name') === 'sourceUuid',
    });
    expect(sourceInput).toBeInTheDocument();
    expect(screen.getByLabelText('from')).toBeInTheDocument();
  });
  it("should render combobox with 'to' name and defaulted to 'main store' location in receipt operation", async () => {
    (useParties as jest.Mock).mockReturnValue({
      destinationParties: [],
      sourceParties: [],
      isLoading: false,
      error: undefined,
      sourceTags: [],
      destinationTags: [],
    });
    render(<StockOperationForm stockOperationType={receiptOperationTypeMock as any} />);
    expect(screen.getByLabelText('to')).toBeInTheDocument();
  });

  it("should render combobox with 'destinationUuid' name and 'chooseADestination' placeholder", async () => {
    (useParties as jest.Mock).mockReturnValue({
      destinationParties: [],
      sourceParties: [],
      isLoading: false,
      error: undefined,
      sourceTags: [],
      destinationTags: [],
    });
    render(<StockOperationForm stockOperationType={receiptOperationTypeMock as any} />);
    expect(
      screen.getByRole('combobox', {
        name: (_, element) =>
          element.getAttribute('placeholder') === 'chooseADestination' &&
          element.getAttribute('name') === 'destinationUuid',
      }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('to')).toBeInTheDocument();
  });
  it("should render combobox with 'sourceUuid' name and 'chooseALocation' placeholder for disposal opertaion", async () => {
    (useParties as jest.Mock).mockReturnValue({
      destinationParties: [],
      sourceParties: [],
      isLoading: false,
      error: undefined,
      sourceTags: [],
      destinationTags: [],
    });
    render(<StockOperationForm stockOperationType={disposalOperationTypeMock as any} />);
    expect(
      screen.getByRole('combobox', {
        name: (_, element) =>
          element.getAttribute('placeholder') === 'chooseALocation' && element.getAttribute('name') === 'sourceUuid',
      }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('location')).toBeInTheDocument();
  });

  it('should not render reason input field for receipt operation', async () => {
    (useParties as jest.Mock).mockReturnValue({
      destinationParties: [],
      sourceParties: [],
      isLoading: false,
      error: undefined,
      sourceTags: [],
      destinationTags: [],
    });
    render(<StockOperationForm stockOperationType={receiptOperationTypeMock as any} />);
    expect(screen.queryByLabelText(/.*reason.*/i)).not.toBeInTheDocument();
  });
  it('should render reason input field for adjustment operation', async () => {
    (useParties as jest.Mock).mockReturnValue({
      destinationParties: [],
      sourceParties: [],
      isLoading: false,
      error: undefined,
      sourceTags: [],
      destinationTags: [],
    });
    render(<StockOperationForm stockOperationType={adjustmentOpeationTypeMock as any} />);
    expect(screen.getByLabelText(/.*reason.*/i)).toBeInTheDocument();
  });
  it('should not render reason input field for opening stock operation', async () => {
    (useParties as jest.Mock).mockReturnValue({
      destinationParties: [],
      sourceParties: [],
      isLoading: false,
      error: undefined,
      sourceTags: [],
      destinationTags: [],
    });
    render(<StockOperationForm stockOperationType={openingStockOperationTypeMock as any} />);
    expect(screen.queryByLabelText(/.*reason.*/i)).not.toBeInTheDocument();
  });
  it('should not render reason input field for requisition operation', async () => {
    (useParties as jest.Mock).mockReturnValue({
      destinationParties: [],
      sourceParties: [],
      isLoading: false,
      error: undefined,
      sourceTags: [],
      destinationTags: [],
    });
    render(<StockOperationForm stockOperationType={requisitionOperationTypeMock as any} />);
    expect(screen.queryByLabelText(/.*reason.*/i)).not.toBeInTheDocument();
  });
  it('should not render reason input field for return operation', async () => {
    (useParties as jest.Mock).mockReturnValue({
      destinationParties: [],
      sourceParties: [],
      isLoading: false,
      error: undefined,
      sourceTags: [],
      destinationTags: [],
    });
    render(<StockOperationForm stockOperationType={returnOperationTypeMock as any} />);
    expect(screen.queryByLabelText(/.*reason.*/i)).not.toBeInTheDocument();
  });
  it('should not render reason input field for issue operation', async () => {
    (useParties as jest.Mock).mockReturnValue({
      destinationParties: [],
      sourceParties: [],
      isLoading: false,
      error: undefined,
      sourceTags: [],
      destinationTags: [],
    });
    render(<StockOperationForm stockOperationType={stockIssueOperationtypeMock as any} />);
    expect(screen.queryByLabelText(/.*reason.*/i)).not.toBeInTheDocument();
  });
  it('should not render reason input field for tranfer out operation', async () => {
    (useParties as jest.Mock).mockReturnValue({
      destinationParties: [],
      sourceParties: [],
      isLoading: false,
      error: undefined,
      sourceTags: [],
      destinationTags: [],
    });
    render(<StockOperationForm stockOperationType={tranferOutOperationTypeMock as any} />);
    expect(screen.queryByLabelText(/.*reason.*/i)).not.toBeInTheDocument();
  });
  it('should render reason input field for disposal operation', async () => {
    (useParties as jest.Mock).mockReturnValue({
      destinationParties: [],
      sourceParties: [],
      isLoading: false,
      error: undefined,
      sourceTags: [],
      destinationTags: [],
    });
    render(<StockOperationForm stockOperationType={disposalOperationTypeMock as any} />);
    expect(screen.getByLabelText(/.*reason.*/i)).toBeInTheDocument();
  });
  it('should render reason input field for stock take operation', async () => {
    (useParties as jest.Mock).mockReturnValue({
      destinationParties: [],
      sourceParties: [],
      isLoading: false,
      error: undefined,
      sourceTags: [],
      destinationTags: [],
    });
    render(<StockOperationForm stockOperationType={stockTakeOperationTypeMock as any} />);
    expect(screen.getByLabelText(/.*reason.*/i)).toBeInTheDocument();
  });
});
