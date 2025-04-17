import React from 'react';
import { render, waitFor, screen, fireEvent } from '@testing-library/react';
import { showSnackbar, useConfig, ErrorState, launchWorkspace } from '@openmrs/esm-framework';
import { useStockOperationTypes, useUser } from '../../stock-lookups/stock-lookups.resource';
import { getStockOperationLinks } from '../stock-operations.resource';
import { StockOperationDTO } from '../../core/api/types/stockOperation/StockOperationDTO';
import { StockOperationType } from '../../core/api/types/stockOperation/StockOperationType';
import { useStockOperations } from '../stock-operations.resource';
import { closeOverlay } from '../../core/components/overlay/hook';
import StockOperationForm from './stock-operation-form.component';
import useParties from './hooks/useParties';
import userEvent from '@testing-library/user-event';
import { StockItemDTO } from '../../core/api/types/stockItem/StockItem';
import { useStockItem, useStockItems, useStockBatches } from '../../stock-items/stock-items.resource';
import { initialStockOperationValue } from '../../core/utils/utils';
import { useForm, useFormContext, Controller, FormProvider } from 'react-hook-form';
import { BaseStockOperationItemFormData, StockOperationItemFormData } from '../validation-schema';
import { useStockItemBatchInformationHook } from '../../stock-items/add-stock-item/batch-information/batch-information.resource';
import { useFilterableStockItems } from './hooks/useFilterableStockItems';
import { formatForDatePicker } from '../../constants';
import { receiptOperationTypeMock } from '../../../__mocks__';
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

  it('should have both previous and next btns', async () => {
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

    expect(screen.getByRole('button', { name: /Next/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument();
  });

  it('should render stock operation items table with item search component', async () => {
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
    await userEvent.click(nextButton);
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(
      screen.getByRole('searchbox', {
        name(accessibleName, element) {
          return (
            element.getAttribute('id') === 'search-stock-operation-item' &&
            element.getAttribute('placeholder') === 'findItems' &&
            element.getAttribute('name') === 'search-stock-operation-item'
          );
        },
      }),
    ).toBeInTheDocument();
  });

  it('should search stock operation item and render results', async () => {
    const mocksetSearchString = jest.fn();
    (useFilterableStockItems as jest.Mock).mockReturnValue({
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
    await userEvent.click(screen.getByRole('button', { name: /Next/i }));
    // -------------------------------
    const searchInput = screen.getByRole('searchbox', {
      name: (_, element) => element.getAttribute('id') === 'search-stock-operation-item',
    });
    expect(searchInput).toBeInTheDocument();
    await userEvent.click(searchInput);
    await userEvent.type(searchInput, 'stock');
    expect(mocksetSearchString).toHaveBeenCalledWith('stock');
    expect(screen.getByText('mock-common-name'));
  });

  it('should properly handle stock operation item selection', async () => {
    (useFilterableStockItems as jest.Mock).mockReturnValue({
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
    await userEvent.click(screen.getByRole('button', { name: /Next/i }));
    // -------------------------------
    const searchInput = screen.getByRole('searchbox', {
      name: (_, element) => element.getAttribute('id') === 'search-stock-operation-item',
    });
    await userEvent.click(searchInput);
    await userEvent.type(searchInput, 'stock');
    await userEvent.click(screen.getByText('mock-common-name'));
    expect(launchWorkspace).toHaveBeenCalled();
  });

  it('should render stock operation items in data table', async () => {
    (useStockItem as jest.Mock).mockReturnValue({
      isLoading: false,
      error: null,
      item: { commonName: 'mock-stock-item-common name', uuid: 'mock-uuid' } as StockItemDTO,
    });
    const mockQuantity = 99999;
    const mockExpiration = new Date();
    (useFormContext as jest.Mock).mockReturnValue({
      watch: jest.fn().mockReturnValue([
        {
          quantity: mockQuantity,
          expiration: mockExpiration,
        },
      ] as BaseStockOperationItemFormData),
      resetField: jest.fn(),
      formState: {
        errors: {},
      },
      getValues: jest.fn(),
      setValue: jest.fn(),
      handleSubmit: jest.fn(),
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
    await userEvent.click(screen.getByRole('button', { name: /Next/i }));
    // -------------------------------
    expect(screen.getByText(mockQuantity.toLocaleString())).toBeInTheDocument(); //Find by quentity
    expect(screen.getByText(formatForDatePicker(mockExpiration))).toBeInTheDocument(); //Find by quentity
  });
});
