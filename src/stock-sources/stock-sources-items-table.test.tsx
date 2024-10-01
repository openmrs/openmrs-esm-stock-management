import React from 'react';
import { renderHook, act, render, screen } from '@testing-library/react';
import useStockSourcesPage from './stock-sources-items-table.resource';
import { useStockSources } from './stock-sources.resource';
import { usePagination } from '@openmrs/esm-framework';
import '@testing-library/jest-dom/extend-expect';
import EditStockSourceActionsMenu from './edit-stock-source/edit-stock-source.component';
import { launchOverlay } from '../core/components/overlay/hook';
import StockSourcesAddOrUpdate from './add-stock-sources/add-stock-sources.component';
import userEvent from '@testing-library/user-event';

jest.mock('./stock-sources.resource');
jest.mock('@openmrs/esm-framework');

jest.mock('../core/components/overlay/hook', () => ({
  launchOverlay: jest.fn(),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key, fallback) => fallback,
  }),
}));

describe('useStockSourcesPage', () => {
  const mockFilter = {};
  const mockItems = {
    results: [{ name: 'Community', acronym: 'Community', sourceType: 'Donation' }],
    totalCount: 1,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return initial values', () => {
    (useStockSources as jest.Mock).mockReturnValue({
      items: mockItems,
      isLoading: false,
      error: null,
    });

    (usePagination as jest.Mock).mockReturnValue({
      goTo: jest.fn(),
      results: mockItems.results,
      currentPage: 1,
    });

    const { result } = renderHook(() => useStockSourcesPage(mockFilter));

    expect(result.current.items).toEqual(mockItems.results);
    expect(result.current.totalItems).toBe(mockItems.totalCount);
    expect(result.current.currentPageSize).toBe(10);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should update current page size', () => {
    (useStockSources as jest.Mock).mockReturnValue({
      items: mockItems,
      isLoading: false,
      error: null,
    });

    (usePagination as jest.Mock).mockReturnValue({
      goTo: jest.fn(),
      results: mockItems.results,
      currentPage: 1,
    });

    const { result } = renderHook(() => useStockSourcesPage(mockFilter));

    act(() => {
      result.current.setPageSize(20);
    });

    expect(result.current.currentPageSize).toBe(20);
  });

  it('should handle loading and error states', () => {
    (useStockSources as jest.Mock).mockReturnValue({
      items: { results: [], totalCount: 0 },
      isLoading: true,
      error: null,
    });

    const { result } = renderHook(() => useStockSourcesPage(mockFilter));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBe(null);
    expect(result.current.totalItems).toBe(0);
  });

  describe('EditStockSourceActionsMenu', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('renders the edit button and opens overlay when clicked without data', async () => {
      render(<EditStockSourceActionsMenu />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();

      await userEvent.click(button);
      expect(launchOverlay).toHaveBeenCalledWith('Edit Stock Source', <StockSourcesAddOrUpdate model={undefined} />);
    });
  });
});
