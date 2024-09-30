import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StockItemsTableComponent from './stock-items-table.component';
import { useStockItemsPages } from './stock-items-table.resource';
import { handleMutate } from '../utils';
import { launchAddOrEditDialog } from './stock-item.utils';

jest.mock('./stock-items-table.resource', () => ({
  useStockItemsPages: jest.fn(),
}));

jest.mock('../utils', () => ({
  handleMutate: jest.fn(),
}));

jest.mock('./stock-item.utils', () => ({
  launchAddOrEditDialog: jest.fn(),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('StockItemsTableComponent', () => {
  const mockUseStockItemsPages = {
    isLoading: false,
    items: Array(25).fill(null).map((_, index) => ({
      uuid: `item-${index}`,
      commonName: `Test Item ${index}`,
      drugUuid: index % 2 === 0 ? `drug-${index}` : null,
      conceptName: `Concept ${index}`,
      dispensingUnitName: `Unit ${index}`,
      defaultStockOperationsUoMName: `UoM ${index}`,
      reorderLevel: index * 10,
      reorderLevelUoMName: 'Units',
    })),
    totalCount: 25,
    currentPageSize: 10,
    setPageSize: jest.fn(),
    pageSizes: [10, 20, 30],
    currentPage: 1,
    setCurrentPage: jest.fn(),
    isDrug: '',
    setDrug: jest.fn(),
    setSearchString: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useStockItemsPages as jest.Mock).mockReturnValue(mockUseStockItemsPages);
  });

  it('renders initial state and UI elements correctly', async () => {
    render(<StockItemsTableComponent />);
    expect(screen.getByText('panelDescription')).toBeInTheDocument();
    expect(screen.getByRole('searchbox')).toBeInTheDocument();
    
    const user = userEvent.setup();
    const menuButton = screen.getByTestId('stock-items-menu');
    await user.click(menuButton);
  
    await screen.findByText('Refresh');
    
    expect(screen.getByText('type')).toBeInTheDocument();
    expect(screen.getByText('genericName')).toBeInTheDocument();
    expect(screen.getByText('commonName')).toBeInTheDocument();
  });

  it('displays skeleton loader when isLoading is true', () => {
    (useStockItemsPages as jest.Mock).mockReturnValue({ ...mockUseStockItemsPages, isLoading: true });
    render(<StockItemsTableComponent />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders table rows correctly based on items prop', () => {
    render(<StockItemsTableComponent />);
    expect(screen.getByText('Test Item 0')).toBeInTheDocument();
    expect(screen.getAllByText('drug').length).toBeGreaterThan(0);
    expect(screen.getAllByText('other').length).toBeGreaterThan(0);
  });

  it('updates search input and triggers search function', async () => {
    render(<StockItemsTableComponent />);
    const user = userEvent.setup();
    const searchInput = screen.getByRole('searchbox');
    await user.type(searchInput, 'test search');
    await waitFor(() => {
      expect(mockUseStockItemsPages.setSearchString).toHaveBeenCalledWith('test search');
    }, { timeout: 2000 });
  });

  it('updates pagination when page or page size changes', async () => {
    render(<StockItemsTableComponent />);
    const user = userEvent.setup();
    const nextPageButton = screen.getByLabelText('Next page');
    await user.click(nextPageButton);
    expect(mockUseStockItemsPages.setCurrentPage).toHaveBeenCalled();

    const pageSizeSelect = screen.getByLabelText('Items per page:');
    await user.selectOptions(pageSizeSelect, '20');
    expect(mockUseStockItemsPages.setPageSize).toHaveBeenCalledWith(20);
  });

  it('triggers handleRefresh when refresh button is clicked', async () => {
    render(<StockItemsTableComponent />);
    
    const user = userEvent.setup();
    const menuButton = screen.getByTestId('stock-items-menu');
    expect(menuButton).toBeInTheDocument();
    await user.click(menuButton);
  
    const refreshButton = await screen.findByText('Refresh');
    expect(refreshButton).toBeInTheDocument();
    await user.click(refreshButton);
    await waitFor(() => {
      expect(handleMutate).toHaveBeenCalledWith(expect.stringContaining('/stockmanagement/stockitem'));
    });
  });

  it('triggers launchAddOrEditDialog when edit button is clicked', async () => {
    render(<StockItemsTableComponent />);
    const user = userEvent.setup();
    const editButtons = screen.getAllByLabelText('Edit Stock Item');
    await user.click(editButtons[0]);
    expect(launchAddOrEditDialog).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({ uuid: 'item-0' }),
      true
    );
  });
});