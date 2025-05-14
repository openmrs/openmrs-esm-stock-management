import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { useFormContext, type UseFormReturn } from 'react-hook-form';
import { useConfig, useSession } from '@openmrs/esm-framework';
import { formatForDatePicker } from '../../constants';
import { receiptOperationTypeMock } from '@mocks';
import { type BaseStockOperationItemFormData } from '../validation-schema';
import { type StockItemDTO } from '../../core/api/types/stockItem/StockItem';
import { useFilterableStockItems } from './hooks/useFilterableStockItems';
import { useStockItem } from '../../stock-items/stock-items.resource';
import { useStockOperations } from '../stock-operations.resource';
import { useStockOperationTypes } from '../../stock-lookups/stock-lookups.resource';
import useParties from './hooks/useParties';
import StockOperationForm from './stock-operation-form.component';

const mockUseConfig = jest.mocked(useConfig);
const mockUseFilterableStockItems = jest.mocked(useFilterableStockItems);
const mockUseFormContext = jest.mocked(useFormContext);
const mockUseParties = jest.mocked(useParties);
const mockUseSession = jest.mocked(useSession);
const mockUseStockItem = jest.mocked(useStockItem);
const mockUseStockOperations = jest.mocked(useStockOperations);
const mockUseStockOperationTypes = jest.mocked(useStockOperationTypes);

jest.mock('../../stock-lookups/stock-lookups.resource', () => ({
  useStockOperationTypes: jest.fn(),
  useUsers: jest.fn().mockReturnValue({ items: { results: [] }, isLoading: false }),
  useUser: jest.fn().mockReturnValue({ data: { display: 'Test User' }, isLoading: false, error: null }),
}));

jest.mock('../stock-operations.resource', () => ({
  operationStatusColor: jest.fn(() => 'some-color'),
  getStockOperationLinks: jest.fn(),
  useStockOperations: jest.fn().mockReturnValue({
    items: {
      results: [],
      links: [],
      totalCount: 0,
    },
    isLoading: false,
    error: null,
  }),
}));

jest.mock('../../core/components/overlay/hook', () => ({
  closeOverlay: jest.fn(),
}));

jest.mock('../../stock-items/stock-items.resource', () => ({
  useStockItem: jest.fn().mockReturnValue({
    isLoading: false,
    item: {},
    error: null,
  }),
  useStockItems: jest.fn().mockReturnValue({
    isLoading: false,
    error: null,
    items: {},
  }),
  useStockBatches: jest.fn().mockReturnValue({
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
  }),
  useFormContext: jest.fn().mockReturnValue({
    watch: jest.fn(),
    formState: {
      errors: {},
      isDirty: false,
      isLoading: false,
      isSubmitted: false,
      isSubmitSuccessful: false,
      isSubmitting: false,
      isValid: true,
      isValidating: false,
      submitCount: 0,
      touchedFields: {},
      dirtyFields: {},
      disabled: false,
    },
    resetField: jest.fn(),
    getValues: jest.fn(),
    setValue: jest.fn(),
    handleSubmit: jest.fn(),
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

describe('Stock Operation step 2 (stock operation items details)', () => {
  beforeEach(() => {
    const mockStockOperationTypes = {
      types: {
        results: [],
        links: [],
        totalCount: 0,
      },
      isLoading: false,
      error: null,
    };

    mockUseStockOperationTypes.mockReturnValue(mockStockOperationTypes);

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

    mockUseParties.mockReturnValue({
      destinationParties: [],
      destinationPartiesFilter: jest.fn(),
      destinationTags: [],
      error: undefined,
      isLoading: false,
      mutate: jest.fn(),
      parties: [],
      sourceParties: [],
      sourcePartiesFilter: jest.fn(),
      sourceTags: [],
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

  it('should have both previous and next btns', async () => {
    const user = userEvent.setup();

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
    await user.click(screen.getByRole('button', { name: /Next/i }));

    expect(screen.getByRole('button', { name: /Next/i })).toBeInTheDocument();
    expect(screen.getByTestId('previous-btn')).toBeInTheDocument();
  });

  it('should render stock operation items table with item search component', async () => {
    const user = userEvent.setup();

    render(
      <StockOperationForm
        stockOperationType={receiptOperationTypeMock as any}
        closeWorkspace={jest.fn()}
        setTitle={jest.fn()}
        closeWorkspaceWithSavedChanges={jest.fn()}
        promptBeforeClosing={jest.fn()}
      />,
    );

    const nextButton = screen.getByRole('button', { name: /Next/i });
    expect(nextButton).toBeInTheDocument();
    await user.click(nextButton);
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(
      screen.getByRole('searchbox', {
        name(accessibleName, element) {
          return (
            element.getAttribute('id') === 'search-stock-operation-item' &&
            element.getAttribute('placeholder') === 'Find your items' &&
            element.getAttribute('name') === 'search-stock-operation-item'
          );
        },
      }),
    ).toBeInTheDocument();
  });

  it('should search stock operation item and render results', async () => {
    const user = userEvent.setup();

    const mocksetSearchString = jest.fn();
    mockUseFilterableStockItems.mockReturnValue({
      stockItemsList: [
        { uuid: 'mock-uuid', commonName: 'mock-common-name', drugName: 'mock-common-name' },
      ] as Array<StockItemDTO>,
      setLimit: jest.fn(),
      setRepresentation: jest.fn(),
      isLoading: false,
      setSearchString: mocksetSearchString,
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

    // ----- CLICK NEXT TO MOVE TO STEP 2 ---------
    await user.click(screen.getByRole('button', { name: /Next/i }));
    // -------------------------------
    const searchInput = screen.getByRole('searchbox', {
      name: /search/i,
    });
    expect(searchInput).toBeInTheDocument();
    await user.click(searchInput);
    await user.type(searchInput, 'stock');
    expect(mocksetSearchString).toHaveBeenCalledWith('stock');
    expect(screen.getByText('mock-common-name'));
  });

  it('should properly handle stock operation item selection', async () => {
    const user = userEvent.setup();

    mockUseFilterableStockItems.mockReturnValue({
      stockItemsList: [
        { uuid: 'mock-uuid', commonName: 'mock-common-name', drugName: 'mock-common-name' },
      ] as Array<StockItemDTO>,
      setLimit: jest.fn(),
      setRepresentation: jest.fn(),
      isLoading: false,
      setSearchString: jest.fn(),
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
    // ----- CLICK NEXT TO MOVE TO STEP 2 ---------
    await user.click(screen.getByRole('button', { name: /Next/i }));
    // -------------------------------
    const searchInput = screen.getByRole('searchbox', {
      name: (_, element) => element.getAttribute('id') === 'search-stock-operation-item',
    });
    await user.click(searchInput);
    await user.type(searchInput, 'stock');
    await user.click(screen.getByText('mock-common-name'));
    // Look for common name at the top of workspace
    expect(screen.getByText(/no drug name available|no common name available|mock-common-name/i)).toBeInTheDocument();
  });

  it('should render stock operation items in data table', async () => {
    const user = userEvent.setup();

    mockUseStockItem.mockReturnValue({
      isLoading: false,
      error: null,
      item: { commonName: 'mock-stock-item-common name', uuid: 'mock-uuid' } as StockItemDTO,
    });

    const mockQuantity = 99999;
    const mockExpiration = new Date();
    mockUseFormContext.mockReturnValue({
      watch: jest.fn().mockReturnValue([
        {
          quantity: mockQuantity,
          expiration: mockExpiration,
        },
      ] as BaseStockOperationItemFormData),
      resetField: jest.fn(),
      formState: {
        errors: {},
        isDirty: false,
        isLoading: false,
        isSubmitted: false,
        isSubmitSuccessful: false,
        isSubmitting: false,
        isValid: true,
        isValidating: false,
        submitCount: 0,
        touchedFields: {},
        dirtyFields: {},
        disabled: false,
      },
      getValues: jest.fn(),
      setValue: jest.fn(),
      handleSubmit: jest.fn(),
    } as unknown as UseFormReturn<BaseStockOperationItemFormData>);

    render(
      <StockOperationForm
        stockOperationType={receiptOperationTypeMock as any}
        closeWorkspace={jest.fn()}
        setTitle={jest.fn()}
        closeWorkspaceWithSavedChanges={jest.fn()}
        promptBeforeClosing={jest.fn()}
      />,
    );

    // ----- CLICK NEXT TO MOVE TO STEP 2 ---------
    await user.click(screen.getByRole('button', { name: /Next/i }));
    // -------------------------------
    expect(screen.getByText(mockQuantity.toLocaleString())).toBeInTheDocument(); //Find by quentity
    expect(screen.getByText(formatForDatePicker(mockExpiration))).toBeInTheDocument(); //Find by quentity
  });
});
