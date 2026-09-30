import { useCallback } from 'react';
import { useSWRConfig } from 'swr';

export const useMutateByPrefix = () => {
  const { mutate } = useSWRConfig();

  return useCallback(
    (url: string) => mutate((key) => typeof key === 'string' && key.startsWith(url), undefined, { revalidate: true }),
    [mutate],
  );
};
