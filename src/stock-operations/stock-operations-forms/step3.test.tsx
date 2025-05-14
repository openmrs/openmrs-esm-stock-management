import { render, waitFor, screen, fireEvent } from '@testing-library/react';
import { showSnackbar, useConfig, ErrorState, launchWorkspace } from '@openmrs/esm-framework';
import { useStockOperationTypes, useUser } from '../../stock-lookups/stock-lookups.resource';
import { getStockOperationLinks, useStockOperation, useStockOperations } from '../stock-operations.resource';
import { StockOperationDTO } from '../../core/api/types/stockOperation/StockOperationDTO';
import { StockOperationType } from '../../core/api/types/stockOperation/StockOperationType';
import { closeOverlay } from '../../core/components/overlay/hook';
import StockOperationForm from './stock-operation-form.component';
import useParties from './hooks/useParties';
import userEvent from '@testing-library/user-event';
import { StockItemDTO } from '../../core/api/types/stockItem/StockItem';
import { useStockItem, useStockItems } from '../../stock-items/stock-items.resource';
import { initialStockOperationValue } from '../../core/utils/utils';
import { useForm, useFormContext, Controller, FormProvider } from 'react-hook-form';
import { BaseStockOperationItemFormData, StockOperationItemFormData } from '../validation-schema';
import { useStockItemBatchInformationHook } from '../../stock-items/add-stock-item/batch-information/batch-information.resource';
import { useFilterableStockItems } from './hooks/useFilterableStockItems';
import { formatForDatePicker } from '../../constants';
import React from 'react';
import { receiptOperationTypeMock, returnOperationTypeMock, stockIssueOperationtypeMock } from '../../../__mocks__';
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
}));

jest.mock('../stock-operations.resource', () => ({
  operationStatusColor: jest.fn(() => 'some-color'),
  getStockOperationLinks: jest.fn(),
  useStockOperations: jest.fn().mockReturnValue({
    items: { results: [] },
    isLoading: false,
    error: null,
  }),
  useStockOperation: jest.fn().mockReturnValue({
    items: undefined,
    isLoading: false,
    error: null,
  }),
  useStockOperationAndItems: jest.fn().mockReturnValue({
    items: undefined,
    isLoading: false,
    error: null,
  }),
}));

jest.mock('../../core/components/overlay/hook', () => ({
  closeOverlay: jest.fn(),
}));

jest.mock('../../stock-items/stock-items.resource', () => ({
  useStockItem: jest.fn(),
  useStockItems: jest.fn().mockReturnValue({
    isLoading: false,
    error: null,
    items: {},
  }),
}));
jest.mock('./hooks/useFilterableStockItems', () => ({
  useFilterableStockItems: jest.fn().mockReturnValue({
    stockItemsList: [],
    setLimit: jest.fn(),
    setRepresentation: jest.fn(),
    setSearchString: jest.fn(),
    isLoading: false,
  }),
}));
jest.mock('./hooks/useParties', () => jest.fn());
jest.mock('react-hook-form', () => ({
  useForm: jest.fn().mockReturnValue({
    watch: jest.fn(),
    formState: {
      errors: {},
    },
    resetField: jest.fn(),
    getValues: jest.fn(),
    setValue: jest.fn(),
    handleSubmit: jest.fn(),
    trigger: jest.fn().mockReturnValue(true),
  }),
  useFormContext: jest.fn().mockReturnValue({
    watch: jest.fn(),
    formState: {
      errors: {},
    },
    resetField: jest.fn(),
    getValues: jest.fn(),
    setValue: jest.fn(),
    handleSubmit: jest.fn(),
    trigger: jest.fn().mockReturnValue(true),
  }),
  Controller: ({ render }) => render({ field: {}, fieldState: {} }),
  FormProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('../../stock-items/add-stock-item/batch-information/batch-information.resource', () => ({
  useStockItemBatchInformationHook: jest.fn().mockReturnValue({
    items: [],
    totalCount: 0,
    currentPage: 1,
    currentPageSize: 10,
    setCurrentPage: jest.fn(),
    setPageSize: jest.fn(),
    pageSizes: [],
    isLoading: false,
    error: undefined,
    setSearchString: jest.fn(),
    setStockItemUuid: jest.fn(),
    setLocationUuid: jest.fn(),
    setPartyUuid: jest.fn(),
    setStockBatchUuid: jest.fn(),
  }),
}));

describe('Stock Operation form step 3 (stock submision)', () => {
  beforeEach(() => {
    const mockStockOperationTypes = { results: [] };
    (useStockOperationTypes as jest.Mock).mockReturnValue(mockStockOperationTypes);
    (useStockOperations as jest.Mock).mockReturnValue({ items: { results: [] }, isLoading: false, error: null });
    (useConfig as jest.Mock).mockReturnValue({ autoPopulateResponsiblePerson: true });
    (useParties as jest.Mock).mockReturnValue({
      destinationParties: [],
      sourceParties: [],
      isLoading: false,
      error: undefined,
      sourceTags: [],
      destinationTags: [],
    });
  });

  it('should have previous btn and not next btn', async () => {
    render(
      <StockOperationForm
        stockOperationType={receiptOperationTypeMock as any}
        closeWorkspace={jest.fn()}
        setTitle={jest.fn()}
        closeWorkspaceWithSavedChanges={jest.fn()}
        promptBeforeClosing={jest.fn()}
      />,
    );
    // MOVE TO STEP 2
    await userEvent.click(screen.getByRole('button', { name: /Next/i }));
    // MOVE TO STEP3
    await userEvent.click(screen.getByRole('button', { name: /Next/i }));

    expect(screen.queryByRole('button', { name: /Next/i })).not.toBeInTheDocument();
    expect(screen.getByTestId('previous-btn')).toBeInTheDocument();
  });

  it('should render require approval radio button and save button', async () => {
    render(
      <StockOperationForm
        stockOperationType={receiptOperationTypeMock as any}
        closeWorkspace={jest.fn()}
        setTitle={jest.fn()}
        closeWorkspaceWithSavedChanges={jest.fn()}
        promptBeforeClosing={jest.fn()}
      />,
    );
    // MOVE TO STEP 2
    await userEvent.click(screen.getByRole('button', { name: /Next/i }));
    // MOVE TO STEP3
    await userEvent.click(screen.getByRole('button', { name: /Next/i }));

    // Shouls have save button
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    expect(screen.getAllByRole('radio', { name: /yes|no/i })).toHaveLength(2);
  });
  it('should render submitForReview button when require aprroval radion button is checked yes', async () => {
    render(
      <StockOperationForm
        stockOperationType={receiptOperationTypeMock as any}
        closeWorkspace={jest.fn()}
        setTitle={jest.fn()}
        closeWorkspaceWithSavedChanges={jest.fn()}
        promptBeforeClosing={jest.fn()}
      />,
    );
    // MOVE TO STEP 2
    await userEvent.click(screen.getByRole('button', { name: /Next/i }));
    // MOVE TO STEP3
    await userEvent.click(screen.getByRole('button', { name: /Next/i }));

    const yesRadioButton = screen.getByRole('radio', { name: /yes/i });
    expect(yesRadioButton).toBeInTheDocument();
    // Submit for review shouldnt be in doc
    expect(screen.queryByRole('button', { name: /submitForReview/i })).not.toBeInTheDocument();
    await userEvent.click(yesRadioButton);
    // On require aprooval should now show
    expect(screen.getByRole('button', { name: /submitForReview/i })).toBeInTheDocument();
  });
  it('should render complete button when require aprroval radion button is checked no', async () => {
    render(
      <StockOperationForm
        stockOperationType={receiptOperationTypeMock as any}
        closeWorkspace={jest.fn()}
        setTitle={jest.fn()}
        closeWorkspaceWithSavedChanges={jest.fn()}
        promptBeforeClosing={jest.fn()}
      />,
    );
    // MOVE TO STEP 2
    await userEvent.click(screen.getByRole('button', { name: /Next/i }));
    // MOVE TO STEP3
    await userEvent.click(screen.getByRole('button', { name: /Next/i }));

    const noRadioButton = screen.getByRole('radio', { name: /no/i });
    expect(noRadioButton).toBeInTheDocument();
    await userEvent.click(noRadioButton);
    // On require aprooval should now show complete btn
    expect(screen.getByTestId('complete-button')).toBeInTheDocument();
  });
  it('should render dispatch btn for stock return operation and dont require aproval', async () => {
    render(
      <StockOperationForm
        stockOperationType={returnOperationTypeMock as any}
        closeWorkspace={jest.fn()}
        setTitle={jest.fn()}
        closeWorkspaceWithSavedChanges={jest.fn()}
        promptBeforeClosing={jest.fn()}
      />,
    );
    // MOVE TO STEP 2
    await userEvent.click(screen.getByRole('button', { name: /Next/i }));
    // MOVE TO STEP3
    await userEvent.click(screen.getByRole('button', { name: /Next/i }));

    const noRadioButton = screen.getByRole('radio', { name: /no/i });
    expect(noRadioButton).toBeInTheDocument();
    await userEvent.click(noRadioButton);
    // On require aprooval should now show complete btn
    expect(screen.getByTestId('dipatch-button')).toBeInTheDocument();
  });
  it('should render dispatch btn for stock issue operation and dont require aproval', async () => {
    render(
      <StockOperationForm
        stockOperationType={stockIssueOperationtypeMock as any}
        closeWorkspace={jest.fn()}
        setTitle={jest.fn()}
        closeWorkspaceWithSavedChanges={jest.fn()}
        promptBeforeClosing={jest.fn()}
      />,
    );
    // MOVE TO STEP 2
    await userEvent.click(screen.getByRole('button', { name: /Next/i }));
    // MOVE TO STEP3
    await userEvent.click(screen.getByRole('button', { name: /Next/i }));

    const noRadioButton = screen.getByRole('radio', { name: /no/i });
    expect(noRadioButton).toBeInTheDocument();
    await userEvent.click(noRadioButton);
    // On require aprooval should now show complete btn
    expect(screen.getByTestId('dipatch-button')).toBeInTheDocument();
  });
});
