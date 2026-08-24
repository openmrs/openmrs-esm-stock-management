import { BatchJobStatusPending } from '../../core/api/types/BatchJob';

export function isPendingReportStale(
  status: string | null | undefined,
  expiration: Date | string | null | undefined,
  now = Date.now(),
): boolean {
  if (status !== BatchJobStatusPending || !expiration) {
    return false;
  }

  const expirationTime = expiration instanceof Date ? expiration.getTime() : new Date(expiration).getTime();

  return Number.isFinite(expirationTime) && expirationTime < now;
}
