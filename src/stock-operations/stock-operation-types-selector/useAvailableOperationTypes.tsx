import { useMemo } from 'react';
import { useStockOperationTypes, useUserRoles } from '../../stock-lookups/stock-lookups.resource';
import { useSystemSettings } from '../../core/hooks/useSystemSettings';

/**
 * Custom hook to fetch and filter available stock operation types based on user roles and system settings.
 * @returns {{
 *   opTypes: Array<Object>,
 *   isLoading: boolean,
 *   error: Error | null
 * }} An object containing filtered operation types, loading state, and any error.
 */
export const useAvailableOperationTypes = () => {
  const { stockOperationTypes: opTypes, isLoading: loadingOpTypes, error: opTypesError } = useStockOperationTypes();
  const { userRoles } = useUserRoles();
  const {
    systemSettings: settings,
    isLoading: loadingSettings,
    error: settingsError,
  } = useSystemSettings('stockmanagement.allowStockIssueWithoutRequisition');

  /**
   * Filter operation types based on user roles.
   */
  const userOpTypes = useMemo(() => {
    if (!opTypes || !userRoles?.operationTypes) return [];

    const userOpTypeIds = new Set(userRoles.operationTypes.map((role) => role.operationTypeUuid));
    return opTypes.filter((opType) => userOpTypeIds.has(opType.uuid));
  }, [opTypes, userRoles]);

  /**
   * Further filter operation types based on system settings.
   */
  const filteredOpTypes = useMemo(() => {
    if (loadingSettings) return userOpTypes;

    const allowIssueWithoutReq = settings?.find(
      ({ property }) => property === 'stockmanagement.allowStockIssueWithoutRequisition',
    )?.value;

    return userOpTypes.filter((opType) => opType.operationType !== 'stockissue' || allowIssueWithoutReq === 'true');
  }, [userOpTypes, loadingSettings, settings]);

  const isLoading = loadingOpTypes || loadingSettings;
  const error = opTypesError || settingsError;

  return {
    availableOperationTypes: filteredOpTypes,
    isLoading,
    error,
  };
};
