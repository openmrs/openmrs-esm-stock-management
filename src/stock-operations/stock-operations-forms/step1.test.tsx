import React from 'react';
import { render, screen } from '@testing-library/react';
import { useConfig, useSession } from '@openmrs/esm-framework';
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
} from '@mocks';
import { useStockOperationTypes } from '../../stock-lookups/stock-lookups.resource';
import { useStockOperations } from '../stock-operations.resource';
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
  useConcept: jest.fn().mockReturnValue({ items: { answers: [] }, isLoading: false, error: null }),
}));

jest.mock('../stock-operations.resource', () => ({
  getStockOperationLinks: jest.fn(),
  operationStatusColor: jest.fn(() => 'some-color'),
  useStockOperations: jest.fn().mockReturnValue({
    items: {
      results: [],
      links: [],
      totalCount: 0,
    },
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

jest.mock('./hooks/useParties', () => ({
  __esModule: true,
  default: jest.fn(),
  useParties: jest.fn(),
}));

describe('Stock Operation step 1 (baseoperation details)', () => {
  beforeEach(() => {
    const mockStockOperationTypes = {
      results: [],
      links: [],
      totalCount: 0,
    };
    mockUseStockOperationTypes.mockReturnValue({
      types: mockStockOperationTypes,
      isLoading: false,
      error: null,
    });
    mockUseStockOperations.mockReturnValue({
      items: {
        results: [],
        links: [],
        totalCount: 0,
      },
      isLoading: false,
      error: null,
    });

    mockUseConfig.mockReturnValue({ autoPopulateResponsiblePerson: true });

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

  it('should render loading state when loading  parties info', async () => {
    mockUseParties.mockReturnValue({
      destinationParties: [],
      destinationPartiesFilter: () => true,
      destinationTags: [],
      error: null,
      isLoading: true,
      mutate: jest.fn(),
      parties: [],
      sourceParties: [],
      sourcePartiesFilter: () => true,
      sourceTags: [],
    });

    render(
      <StockOperationForm
        stockOperationType={receiptOperationTypeMock as any}
        closeWorkspace={jest.fn()}
        setTitle={jest.fn()}
        closeWorkspaceWithSavedChanges={jest.fn()}
        promptBeforeClosing={jest.fn()}
      />,
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should render error state when parties loading fails', async () => {
    mockUseParties.mockReturnValue({
      destinationParties: [],
      destinationPartiesFilter: () => true,
      destinationTags: [],
      error: 'error',
      isLoading: false,
      mutate: jest.fn(),
      parties: [],
      sourceParties: [],
      sourcePartiesFilter: () => true,
      sourceTags: [],
    });

    render(
      <StockOperationForm
        stockOperationType={receiptOperationTypeMock as any}
        closeWorkspace={jest.fn()}
        setTitle={jest.fn()}
        closeWorkspaceWithSavedChanges={jest.fn()}
        promptBeforeClosing={jest.fn()}
      />,
    );

    expect(screen.getByText(/error state/i)).toBeInTheDocument();
  });

  it('should have only next btn and not previous btn', async () => {
    mockUseParties.mockReturnValue({
      destinationParties: [],
      destinationPartiesFilter: () => true,
      destinationTags: [],
      error: undefined,
      isLoading: false,
      mutate: jest.fn(),
      parties: [],
      sourceParties: [],
      sourcePartiesFilter: () => true,
      sourceTags: [],
    });

    render(
      <StockOperationForm
        stockOperationType={receiptOperationTypeMock as any}
        closeWorkspace={jest.fn()}
        setTitle={jest.fn()}
        closeWorkspaceWithSavedChanges={jest.fn()}
        promptBeforeClosing={jest.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /previous/i })).not.toBeInTheDocument();
  });

  it('should render operation type in title', async () => {
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
    render(
      <StockOperationForm
        stockOperationType={receiptOperationTypeMock as any}
        closeWorkspace={jest.fn()}
        setTitle={jest.fn()}
        closeWorkspaceWithSavedChanges={jest.fn()}
        promptBeforeClosing={jest.fn()}
      />,
    );
    expect(screen.getByRole('heading', { name: `${receiptOperationTypeMock.name} Details` })).toBeInTheDocument();
  });

  it("should render combobox with 'from' name and 'choose a source' placeholder for receipt operation", async () => {
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
    render(
      <StockOperationForm
        stockOperationType={receiptOperationTypeMock as any}
        closeWorkspace={jest.fn()}
        setTitle={jest.fn()}
        closeWorkspaceWithSavedChanges={jest.fn()}
        promptBeforeClosing={jest.fn()}
      />,
    );
    const sourceInput = screen.getByRole('combobox', {
      name: (_, element) =>
        element.getAttribute('placeholder') === 'Choose a source' && element.getAttribute('name') === 'sourceUuid',
    });
    expect(sourceInput).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /from/i })).toBeInTheDocument();
  });

  it("should render combobox with 'to' name and defaulted to 'main store' location in receipt operation", async () => {
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

    render(
      <StockOperationForm
        stockOperationType={receiptOperationTypeMock as any}
        closeWorkspace={jest.fn()}
        setTitle={jest.fn()}
        closeWorkspaceWithSavedChanges={jest.fn()}
        promptBeforeClosing={jest.fn()}
      />,
    );

    expect(screen.getByRole('combobox', { name: /to/i })).toBeInTheDocument();
  });

  it("should render combobox with 'destinationUuid' name and 'chooseADestination' placeholder", async () => {
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

    render(
      <StockOperationForm
        stockOperationType={receiptOperationTypeMock as any}
        closeWorkspace={jest.fn()}
        setTitle={jest.fn()}
        closeWorkspaceWithSavedChanges={jest.fn()}
        promptBeforeClosing={jest.fn()}
      />,
    );

    expect(
      screen.getByRole('combobox', {
        name: (_, element) =>
          element.getAttribute('placeholder') === 'Choose a destination' &&
          element.getAttribute('name') === 'destinationUuid',
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /to/i })).toBeInTheDocument();
  });

  it("should render combobox with 'sourceUuid' name and 'chooseALocation' placeholder for disposal operation", async () => {
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

    render(
      <StockOperationForm
        stockOperationType={disposalOperationTypeMock as any}
        closeWorkspace={jest.fn()}
        setTitle={jest.fn()}
        closeWorkspaceWithSavedChanges={jest.fn()}
        promptBeforeClosing={jest.fn()}
      />,
    );

    expect(
      screen.getByRole('combobox', {
        name: (_, element) =>
          element.getAttribute('placeholder') === 'Choose a location' && element.getAttribute('name') === 'sourceUuid',
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /location/i })).toBeInTheDocument();
  });

  it('should not render reason input field for receipt operation', async () => {
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

    render(
      <StockOperationForm
        stockOperationType={receiptOperationTypeMock as any}
        closeWorkspace={jest.fn()}
        setTitle={jest.fn()}
        closeWorkspaceWithSavedChanges={jest.fn()}
        promptBeforeClosing={jest.fn()}
      />,
    );
    expect(screen.queryByRole('combobox', { name: /reason/i })).not.toBeInTheDocument();
  });

  it('should render reason input field for adjustment operation', async () => {
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

    render(
      <StockOperationForm
        stockOperationType={adjustmentOpeationTypeMock as any}
        closeWorkspace={jest.fn()}
        setTitle={jest.fn()}
        closeWorkspaceWithSavedChanges={jest.fn()}
        promptBeforeClosing={jest.fn()}
      />,
    );
    expect(screen.getByRole('combobox', { name: /reason/i })).toBeInTheDocument();
  });

  it('should not render reason input field for opening stock operation', async () => {
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

    render(
      <StockOperationForm
        stockOperationType={openingStockOperationTypeMock as any}
        closeWorkspace={jest.fn()}
        setTitle={jest.fn()}
        closeWorkspaceWithSavedChanges={jest.fn()}
        promptBeforeClosing={jest.fn()}
      />,
    );
    expect(screen.queryByRole('combobox', { name: /reason/i })).not.toBeInTheDocument();
  });

  it('should not render reason input field for requisition operation', async () => {
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

    render(
      <StockOperationForm
        stockOperationType={requisitionOperationTypeMock as any}
        closeWorkspace={jest.fn()}
        setTitle={jest.fn()}
        closeWorkspaceWithSavedChanges={jest.fn()}
        promptBeforeClosing={jest.fn()}
      />,
    );
    expect(screen.queryByRole('combobox', { name: /reason/i })).not.toBeInTheDocument();
  });

  it('should not render reason input field for return operation', async () => {
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

    render(
      <StockOperationForm
        stockOperationType={returnOperationTypeMock as any}
        closeWorkspace={jest.fn()}
        setTitle={jest.fn()}
        closeWorkspaceWithSavedChanges={jest.fn()}
        promptBeforeClosing={jest.fn()}
      />,
    );

    expect(screen.queryByRole('combobox', { name: /reason/i })).not.toBeInTheDocument();
  });

  it('should not render reason input field for issue operation', async () => {
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

    render(
      <StockOperationForm
        stockOperationType={stockIssueOperationtypeMock as any}
        closeWorkspace={jest.fn()}
        setTitle={jest.fn()}
        closeWorkspaceWithSavedChanges={jest.fn()}
        promptBeforeClosing={jest.fn()}
      />,
    );

    expect(screen.queryByRole('combobox', { name: /reason/i })).not.toBeInTheDocument();
  });

  it('should not render reason input field for tranfer out operation', async () => {
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

    render(
      <StockOperationForm
        stockOperationType={tranferOutOperationTypeMock as any}
        closeWorkspace={jest.fn()}
        setTitle={jest.fn()}
        closeWorkspaceWithSavedChanges={jest.fn()}
        promptBeforeClosing={jest.fn()}
      />,
    );

    expect(screen.queryByRole('combobox', { name: /reason/i })).not.toBeInTheDocument();
  });

  it('should render reason input field for disposal operation', async () => {
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

    render(
      <StockOperationForm
        stockOperationType={disposalOperationTypeMock as any}
        closeWorkspace={jest.fn()}
        setTitle={jest.fn()}
        closeWorkspaceWithSavedChanges={jest.fn()}
        promptBeforeClosing={jest.fn()}
      />,
    );
    expect(screen.getByRole('combobox', { name: /reason/i })).toBeInTheDocument();
  });

  it('should render reason input field for stock take operation', async () => {
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

    render(
      <StockOperationForm
        stockOperationType={stockTakeOperationTypeMock as any}
        closeWorkspace={jest.fn()}
        setTitle={jest.fn()}
        closeWorkspaceWithSavedChanges={jest.fn()}
        promptBeforeClosing={jest.fn()}
      />,
    );

    expect(screen.getByRole('combobox', { name: /reason/i })).toBeInTheDocument();
  });
});
