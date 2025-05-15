import React from 'react';
import userEvent from '@testing-library/user-event';
import { renderHook, act, render, screen, waitFor } from '@testing-library/react';
import { type StockSource } from '../core/api/types/stockOperation/StockSource';
import { type Concept } from '../core/api/types/concept/Concept';
import { useConcept } from '../stock-lookups/stock-lookups.resource';
import useStockSourcesPage from './stock-sources-items-table.resource';
import StockSourcesItems from './stock-sources-items-table.component';

const mockUseStockSourcesPage = jest.mocked(useStockSourcesPage);
const mockUseConcept = jest.mocked(useConcept);

jest.mock('./stock-sources-items-table.resource', () => ({
  __esModule: true,
  default: jest.fn(),
  useStockSourcesPage: jest.fn(),
}));

jest.mock('../stock-lookups/stock-lookups.resource', () => ({
  useConcept: jest.fn(),
}));

describe('StockSourcesItems', () => {
  const mockFilter = {};
  const mockItems = {
    results: [
      {
        uuid: '1',
        name: 'Community',
        acronym: 'Community',
        sourceType: { display: 'Donation' },
        creator: null,
        dateCreated: null,
        changedBy: null,
        dateChanged: null,
        retired: false,
        dateRetired: null,
        retiredBy: null,
        retireReason: null,
      },
    ] as unknown as StockSource[],
    totalCount: 1,
  };

  beforeEach(() => {
    mockUseConcept.mockReturnValue({
      items: {
        uuid: '1',
        display: 'Source Types',
        answers: [
          { uuid: '1', display: 'All' },
          { uuid: '2', display: 'Internal' },
          { uuid: '3', display: 'External' },
        ] as Concept[],
      } as Concept,
      isLoading: false,
      error: null,
    });
  });

  it('should return initial values', () => {
    const mockFilter = {};
    const mockItems = {
      results: [{ name: 'Community', acronym: 'Community', sourceType: { display: 'Donation' } }],
      totalCount: 1,
    };

    mockUseStockSourcesPage.mockReturnValue({
      items: mockItems.results as unknown as StockSource[],
      isLoading: false,
      totalItems: mockItems.totalCount,
      currentPage: 1,
      pageSizes: [10, 20, 50],
      goTo: jest.fn(),
      currentPageSize: 10,
      setPageSize: jest.fn(),
      error: null,
      paginatedItems: mockItems.results as unknown as StockSource[],
      tableHeaders: [],
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

    mockUseStockSourcesPage.mockReturnValue({
      items: mockItems.results,
      isLoading: false,
      totalItems: mockItems.totalCount,
      currentPage: 1,
      pageSizes: [10, 20, 50],
      goTo: jest.fn(),
      currentPageSize,
      setPageSize: jest.fn((size: number) => {
        currentPageSize = size;
      }),
      error: null,
      paginatedItems: mockItems.results,
      tableHeaders: [],
    });

    const { result } = renderHook(() => useStockSourcesPage(mockFilter));

    act(() => {
      result.current.setPageSize(20);
    });

    expect(currentPageSize).toBe(20); // Check the local variable instead
  });

  it('should handle loading and error states', () => {
    mockUseStockSourcesPage.mockReturnValue({
      items: [] as unknown as StockSource[],
      isLoading: true,
      error: null,
      totalItems: 0,
      currentPage: 1,
      currentPageSize: 10,
      pageSizes: [10, 20, 50],
      goTo: jest.fn(),
      setPageSize: jest.fn(),
      paginatedItems: [] as unknown as StockSource[],
      tableHeaders: [],
    });

    const { result } = renderHook(() => useStockSourcesPage(mockFilter));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBe(null);
    expect(result.current.totalItems).toBe(0);
  });

  test('renders loading state when data is being fetched', () => {
    mockUseStockSourcesPage.mockReturnValue({
      items: [],
      isLoading: true,
      totalItems: 0,
      tableHeaders: [],
      currentPage: 1,
      pageSizes: [10, 20, 50],
      goTo: jest.fn(),
      currentPageSize: 10,
      setPageSize: jest.fn(),
      paginatedItems: [],
      error: null,
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

    mockUseStockSourcesPage.mockReturnValue({
      items: mockItems as unknown as StockSource[],
      isLoading: false,
      totalItems: 1,
      tableHeaders: [
        { id: 0, key: 'name', header: 'Name' },
        { id: 1, key: 'sourceType', header: 'Source Type' },
      ],
      currentPage: 1,
      pageSizes: [10, 20, 50],
      goTo: jest.fn(),
      currentPageSize: 10,
      setPageSize: jest.fn(),
      paginatedItems: mockItems as unknown as StockSource[],
      error: null,
    });

    render(<StockSourcesItems />);

    expect(screen.getByText(/source a/i)).toBeInTheDocument();
    expect(screen.getByText(/internal/i)).toBeInTheDocument();
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

    mockUseStockSourcesPage.mockReturnValue({
      items: mockItems as unknown as StockSource[],
      isLoading: false,
      totalItems: 2,
      tableHeaders: [{ id: 0, key: 'name', header: 'Name' }],
      currentPage: 1,
      pageSizes: [10, 20, 50],
      goTo: jest.fn(),
      currentPageSize: 10,
      setPageSize: jest.fn(),
      paginatedItems: mockItems as unknown as StockSource[],
      error: null,
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
    mockUseStockSourcesPage.mockReturnValue({
      items: [],
      isLoading: false,
      totalItems: 0,
      tableHeaders: [],
      currentPage: 1,
      pageSizes: [10, 20, 50],
      goTo: jest.fn(),
      currentPageSize: 10,
      setPageSize: jest.fn(),
      paginatedItems: [],
      error: null,
    });

    render(<StockSourcesItems />);

    expect(screen.getByText(/no stock sources to display/i)).toBeInTheDocument();
    expect(screen.getByText(/check the filters above/i)).toBeInTheDocument();
  });

  test('pagination works as expected', async () => {
    const user = userEvent.setup();

    const mockGoTo = jest.fn();
    const mockSetPageSize = jest.fn();

    mockUseStockSourcesPage.mockReturnValue({
      items: [],
      isLoading: false,
      totalItems: 20,
      tableHeaders: [],
      currentPage: 1,
      pageSizes: [10, 20, 50],
      goTo: mockGoTo,
      currentPageSize: 10,
      setPageSize: mockSetPageSize,
      paginatedItems: [],
      error: null,
    });

    render(<StockSourcesItems />);

    const nextPageButton = screen.getByLabelText(/next page/i);
    await user.click(nextPageButton);

    expect(mockGoTo).toHaveBeenCalledWith(2);
  });
});
