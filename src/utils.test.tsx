import React, { type PropsWithChildren } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import useSWR, { SWRConfig, mutate as globalMutate } from 'swr';
import { describe, expect, it, vi } from 'vitest';
import { useMutateByPrefix } from './utils';

describe('useMutateByPrefix', () => {
  it('revalidates matching string keys in the provider cache, which global mutate cannot reach', async () => {
    const prefix = '/stockmanagement/stockrule';
    const firstKey = `${prefix}?stockItemUuid=first`;
    const secondKey = `${prefix}?stockItemUuid=second`;
    const otherKey = '/stockmanagement/stockitem';
    const arrayKey = [prefix, 'array'];
    const fetcher = vi.fn(async (key: string | string[]) => ({ key }));
    const cache = new Map();
    const wrapper = ({ children }: PropsWithChildren) => (
      <SWRConfig value={{ provider: () => cache, dedupingInterval: 0 }}>{children}</SWRConfig>
    );
    const { result } = renderHook(
      () => ({
        first: useSWR(firstKey, fetcher),
        second: useSWR(secondKey, fetcher),
        other: useSWR(otherKey, fetcher),
        array: useSWR(arrayKey, fetcher),
        mutateByPrefix: useMutateByPrefix(),
      }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.first.data).toBeDefined());
    await waitFor(() => expect(result.current.second.data).toBeDefined());
    await waitFor(() => expect(result.current.other.data).toBeDefined());
    await waitFor(() => expect(result.current.array.data).toBeDefined());
    fetcher.mockClear();

    await act(async () => {
      await globalMutate((key) => typeof key === 'string' && key.startsWith(prefix), undefined, { revalidate: true });
    });
    expect(fetcher).not.toHaveBeenCalled();

    await act(async () => {
      await result.current.mutateByPrefix(prefix);
    });
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(fetcher).toHaveBeenCalledWith(firstKey);
    expect(fetcher).toHaveBeenCalledWith(secondKey);
    expect(result.current.other.data).toEqual({ key: otherKey });
    expect(result.current.array.data).toEqual({ key: arrayKey });
  });

  it('keeps the callback stable and leaves other provider caches untouched', async () => {
    const key = '/stockmanagement/stockrule?stockItemUuid=shared';
    const fetcher = vi.fn(async () => 'rules');
    const otherFetcher = vi.fn(async () => 'other rules');
    const cache = new Map();
    const otherCache = new Map();
    const wrapper = ({ children }: PropsWithChildren) => (
      <SWRConfig value={{ provider: () => cache }}>{children}</SWRConfig>
    );
    const otherWrapper = ({ children }: PropsWithChildren) => (
      <SWRConfig value={{ provider: () => otherCache }}>{children}</SWRConfig>
    );
    const { result, rerender } = renderHook(
      () => ({ rules: useSWR(key, fetcher), mutateByPrefix: useMutateByPrefix() }),
      { wrapper },
    );
    const { result: otherResult } = renderHook(() => useSWR(key, otherFetcher).data, { wrapper: otherWrapper });
    await waitFor(() => expect(result.current.rules.data).toBe('rules'));
    await waitFor(() => expect(otherResult.current).toBe('other rules'));
    const callback = result.current.mutateByPrefix;
    rerender();
    expect(result.current.mutateByPrefix).toBe(callback);
    fetcher.mockClear();
    otherFetcher.mockClear();

    await act(async () => {
      await result.current.mutateByPrefix('/stockmanagement/stockrule');
    });
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(otherFetcher).not.toHaveBeenCalled();
  });
});
