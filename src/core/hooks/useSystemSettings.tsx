import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { SystemSettingResponse } from '../../types';

/**
 * Custom hook to fetch system settings based on a given property.
 *
 * @param {string} property - The property name to query for in the system settings.
 * @returns {{
 *   systemSettings: Array<SystemSetting> | [],
 *   isLoading: boolean,
 *   error: Error | undefined
 * }} An object containing the fetched system settings, loading state, and any error.
 *
 * @example
 * const { systemSettings, isLoading, error } = useSystemSettings('some.property.name');
 */
export const useSystemSettings = (property: string) => {
  const url = `${restBaseUrl}/systemsetting?q=${property}&v=custom:(uuid,property,display,value)`;
  const { data, isLoading, error } = useSWR<{ data: SystemSettingResponse }>(url, openmrsFetch);
  const systemSettings = data?.data?.results ?? [];
  return {
    systemSettings,
    isLoading,
    error,
  };
};
