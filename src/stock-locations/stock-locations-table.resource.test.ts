import { renderHook } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { useFhirFetchAll } from '@openmrs/esm-framework';
import { useStockLocationPages } from './stock-locations-table.resource';

it('exposes the FHIR list mutator through the location pagination hook', async () => {
  const mutate = vi.fn();
  vi.mocked(useFhirFetchAll).mockReturnValue({
    data: [],
    error: undefined,
    isLoading: false,
    mutate,
    totalCount: 0,
    hasMore: false,
    loadMore: vi.fn(),
    isValidating: false,
    nextUri: null,
  });
  const { result } = renderHook(() => useStockLocationPages({}));
  expect(useFhirFetchAll).toHaveBeenCalledWith(expect.stringContaining('/Location?_summary=data&_tag='));
  await result.current.mutate();
  expect(mutate).toHaveBeenCalledOnce();
});
