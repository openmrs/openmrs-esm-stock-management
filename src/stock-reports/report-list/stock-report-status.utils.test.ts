import { describe, expect, it } from 'vitest';
import { BatchJobStatusCompleted, BatchJobStatusPending, BatchJobStatusRunning } from '../../core/api/types/BatchJob';
import { isPendingReportStale } from './stock-report-status.utils';

describe('isPendingReportStale', () => {
  const now = new Date('2026-08-24T12:00:00.000Z').getTime();

  it('marks an expired pending report as stale', () => {
    expect(isPendingReportStale(BatchJobStatusPending, '2026-08-24T11:59:59.000Z', now)).toBe(true);
  });

  it('does not mark a pending report with a future expiration as stale', () => {
    expect(isPendingReportStale(BatchJobStatusPending, '2026-08-24T12:00:01.000Z', now)).toBe(false);
  });

  it.each([BatchJobStatusRunning, BatchJobStatusCompleted])('does not mark a %s report as stale', (status) => {
    expect(isPendingReportStale(status, '2026-08-24T11:59:59.000Z', now)).toBe(false);
  });

  it('does not mark a report with an invalid expiration as stale', () => {
    expect(isPendingReportStale(BatchJobStatusPending, 'not-a-date', now)).toBe(false);
  });
});
