import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { useConfig, useSession } from '@openmrs/esm-framework';
import { receiptOperationTypeMock, returnOperationTypeMock, stockIssueOperationtypeMock } from '@mocks';
import { useStockOperations } from '../stock-operations.resource';
import { useStockOperationTypes } from '../../stock-lookups/stock-lookups.resource';
import useParties from './hooks/useParties';
import StockOperationForm from './stock-operation-form.component';

const mockUseParties = jest.mocked(useParties);
const mockUseStockOperationTypes = jest.mocked(useStockOperationTypes);
const mockUseStockOperations = jest.mocked(useStockOperations);
const mockUseConfig = jest.mocked(useConfig);
const mockUseSession = jest.mocked(useSession);

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
    mockUseStockOperationTypes.mockReturnValue({
      types: { results: [], links: [], totalCount: 0 },
      isLoading: false,
      error: null,
    });

    mockUseStockOperations.mockReturnValue({
      items: { results: [], links: [], totalCount: 0 },
      isLoading: false,
      error: null,
    });

    mockUseConfig.mockReturnValue({ autoPopulateResponsiblePerson: true });

    mockUseParties.mockReturnValue({
      destinationParties: [],
      sourceParties: [],
      isLoading: false,
      error: undefined,
      sourceTags: [],
      destinationTags: [],
      parties: [],
      mutate: jest.fn(),
      sourcePartiesFilter: () => true,
      destinationPartiesFilter: () => true,
    });

    mockUseSession.mockReturnValue({
      authenticated: true,
      sessionId: 'test-session-id',
      user: {
        uuid: 'test-user-uuid',
        display: 'Test User',
        username: 'testuser',
        systemId: 'test-system-id',
        userProperties: {},
        person: { uuid: 'test-person-uuid' },
        privileges: [],
        roles: [],
        retired: false,
        links: [],
        locale: 'en',
        allowedLocales: ['en'],
      },
      sessionLocation: {
        uuid: 'test-location-uuid',
        display: 'Test Location',
        links: [],
      },
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
    await userEvent.click(screen.getByRole('button', { name: /next/i }));
    // MOVE TO STEP3
    await userEvent.click(screen.getByRole('button', { name: /next/i }));

    expect(screen.queryByRole('button', { name: /next/i })).not.toBeInTheDocument();
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
    await userEvent.click(screen.getByRole('button', { name: /next/i }));
    // MOVE TO STEP3
    await userEvent.click(screen.getByRole('button', { name: /next/i }));

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
    await userEvent.click(screen.getByRole('button', { name: /next/i }));
    // MOVE TO STEP3
    await userEvent.click(screen.getByRole('button', { name: /next/i }));

    const yesRadioButton = screen.getByRole('radio', { name: /yes/i });
    expect(yesRadioButton).toBeInTheDocument();
    // Submit for review shouldnt be in doc
    expect(screen.queryByRole('button', { name: /submit for review/i })).not.toBeInTheDocument();
    await userEvent.click(yesRadioButton);
    // On require aprooval should now show
    expect(screen.getByRole('button', { name: /submit for review/i })).toBeInTheDocument();
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
    await userEvent.click(screen.getByRole('button', { name: /next/i }));
    // MOVE TO STEP3
    await userEvent.click(screen.getByRole('button', { name: /next/i }));

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
    await userEvent.click(screen.getByRole('button', { name: /next/i }));
    // MOVE TO STEP3
    await userEvent.click(screen.getByRole('button', { name: /next/i }));

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
    await userEvent.click(screen.getByRole('button', { name: /next/i }));
    // MOVE TO STEP3
    await userEvent.click(screen.getByRole('button', { name: /next/i }));

    const noRadioButton = screen.getByRole('radio', { name: /no/i });
    expect(noRadioButton).toBeInTheDocument();
    await userEvent.click(noRadioButton);
    // On require approval should now show complete btn
    expect(screen.getByTestId('dipatch-button')).toBeInTheDocument();
  });
});
