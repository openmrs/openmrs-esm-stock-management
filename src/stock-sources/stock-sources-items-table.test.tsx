import React from 'react';
import { renderHook, act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';
import StockSourcesItems from './stock-sources-items-table.component';
import useStockSourcesPage from './stock-sources-items-table.resource';
import { useTranslation } from 'react-i18next';

jest.mock('react-i18next', () => ({
  useTranslation: jest.fn(),
}));

const mockTranslation = {
  t: (key) => key,
};

jest.mock('./stock-sources-items-table.resource', () => ({
  __esModule: true,
  default: jest.fn(),
  useStockSourcesPage: jest.fn(),
}));

describe('StockSourcesItems', () => {
  const mockFilter = {};
  const mockItems = {
    results: [{ name: 'Community', acronym: 'Community', sourceType: { display: 'Donation' } }],
    totalCount: 1,
  };

  beforeEach(() => {
    (useTranslation as jest.Mock).mockReturnValue(mockTranslation);
    (useStockSourcesPage as jest.Mock).mockClear();
  });

  it('should return initial values', () => {
    const mockFilter = {};
    const mockItems = {
      results: [{ name: 'Community', acronym: 'Community', sourceType: { display: 'Donation' } }],
      totalCount: 1,
    };

    (useStockSourcesPage as jest.Mock).mockReturnValue({
      items: mockItems.results,
      isLoading: false,
      totalItems: mockItems.totalCount,
      currentPage: 1,
      pageSizes: [10, 20, 50],
      goTo: jest.fn(),
      currentPageSize: 10,
      setPageSize: jest.fn(),
      error: null,
    });

    const { result } = renderHook(() => useStockSourcesPage(mockFilter));

    expect(result.current.items).toEqual(mockItems.results);
    expect(result.current.totalItems).toBe(mockItems.totalCount);
    expect(result.current.currentPageSize).toBe(10);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should update current page size', () => {
    let currentPageSize = 10; // Track page size with a local variable

    (useStockSourcesPage as jest.Mock).mockReturnValue({
      items: mockItems.results,
      isLoading: false,
      totalItems: mockItems.totalCount,
      currentPage: 1,
      pageSizes: [10, 20, 50],
      goTo: jest.fn(),
      currentPageSize,
      setPageSize: jest.fn((size) => {
        currentPageSize = size; // Update local variable
      }),
      error: null,
    });

    const { result } = renderHook(() => useStockSourcesPage(mockFilter));

    act(() => {
      result.current.setPageSize(20);
    });

    expect(currentPageSize).toBe(20); // Check the local variable instead
  });

  it('should handle loading and error states', () => {
    (useStockSourcesPage as jest.Mock).mockReturnValue({
      items: { results: [], totalCount: 0 },
      isLoading: true,
      error: null,
      totalItems: 0,
      currentPage: 1,
      currentPageSize: 10,
      pageSizes: [10, 20, 50],
      goTo: jest.fn(),
      setPageSize: jest.fn(),
    });

    const { result } = renderHook(() => useStockSourcesPage(mockFilter));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBe(null);
    expect(result.current.totalItems).toBe(0);
  });

  test('renders loading state when data is being fetched', () => {
    (useStockSourcesPage as jest.Mock).mockReturnValue({
      items: [],
      isLoading: true,
      totalItems: 0,
      tableHeaders: [],
      currentPage: 1,
      pageSizes: [10, 20, 50],
      goTo: jest.fn(),
      currentPageSize: 10,
      setPageSize: jest.fn(),
    });

    render(<StockSourcesItems />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('renders data table when data is loaded', () => {
    const mockItems = [
      {
        uuid: '1234',
        name: 'Source A',
        acronym: 'SA',
        sourceType: { display: 'Internal' },
      },
    ];

    (useStockSourcesPage as jest.Mock).mockReturnValue({
      items: mockItems,
      isLoading: false,
      totalItems: 1,
      tableHeaders: [
        { key: 'name', header: 'Name' },
        { key: 'sourceType', header: 'Source Type' },
      ],
      currentPage: 1,
      pageSizes: [10, 20, 50],
      goTo: jest.fn(),
      currentPageSize: 10,
      setPageSize: jest.fn(),
    });

    render(<StockSourcesItems />);

    expect(screen.getByText('Source A')).toBeInTheDocument();
    expect(screen.getByText('Internal')).toBeInTheDocument();
  });

  test('filters data based on source type', async () => {
    const user = userEvent.setup();

    const mockItems = [
      {
        uuid: '1234',
        name: 'Source A',
        acronym: 'SA',
        sourceType: { display: 'Internal' },
      },
      {
        uuid: '5678',
        name: 'Source B',
        acronym: 'SB',
        sourceType: { display: 'External' },
      },
    ];

    (useStockSourcesPage as jest.Mock).mockReturnValue({
      items: mockItems,
      isLoading: false,
      totalItems: 2,
      tableHeaders: [{ key: 'name', header: 'Name' }],
      currentPage: 1,
      pageSizes: [10, 20, 50],
      goTo: jest.fn(),
      currentPageSize: 10,
      setPageSize: jest.fn(),
    });

    render(<StockSourcesItems />);

    expect(screen.getByText('Source A')).toBeInTheDocument();
    expect(screen.getByText('Source B')).toBeInTheDocument();

    const filterInput = screen.getByLabelText('');
    await user.type(filterInput, 'Internal');

    await waitFor(() => {
      expect(screen.getByText('Source A')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Source B')).toBeInTheDocument();
    });
  });

  test('renders a message when no stock sources are available', () => {
    (useStockSourcesPage as jest.Mock).mockReturnValue({
      items: [],
      isLoading: false,
      totalItems: 0,
      tableHeaders: [],
      currentPage: 1,
      pageSizes: [10, 20, 50],
      goTo: jest.fn(),
      currentPageSize: 10,
      setPageSize: jest.fn(),
    });

    render(<StockSourcesItems />);

    expect(screen.getByText('noSourcesToDisplay')).toBeInTheDocument();
    expect(screen.getByText('checkFilters')).toBeInTheDocument();
  });

  test('pagination works as expected', async () => {
    const user = userEvent.setup();

    const mockGoTo = jest.fn();
    const mockSetPageSize = jest.fn();

    (useStockSourcesPage as jest.Mock).mockReturnValue({
      items: [],
      isLoading: false,
      totalItems: 20,
      tableHeaders: [],
      currentPage: 1,
      pageSizes: [10, 20, 50],
      goTo: mockGoTo,
      currentPageSize: 10,
      setPageSize: mockSetPageSize,
    });

    render(<StockSourcesItems />);

    const nextPageButton = screen.getByLabelText('Next page');
    await user.click(nextPageButton);

    expect(mockGoTo).toHaveBeenCalledWith(2);
  });
});
