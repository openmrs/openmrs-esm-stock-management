import { describe, expect, it } from 'vitest';
import { stockOperationItemDtoSchema } from './validation-schema';

const daysFromNow = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

// the other fields are left out on purpose, only the issues for operationDate are checked
const operationDateIssues = (operationDate: Date | string) => {
  const result = stockOperationItemDtoSchema.safeParse({ operationDate });
  return 'error' in result ? result.error.issues.filter((issue) => issue.path[0] === 'operationDate') : [];
};

describe('stockOperationItemDtoSchema operationDate', () => {
  it('rejects a date after today with the same message as the server', () => {
    const issues = operationDateIssues(daysFromNow(1));

    expect(issues).toHaveLength(1);
    expect(issues[0].message).toBe('Operation date must not be in the future');
  });

  it('rejects a future date that is given as a string', () => {
    expect(operationDateIssues(daysFromNow(30).toISOString())).toHaveLength(1);
  });

  it('accepts today', () => {
    expect(operationDateIssues(new Date())).toHaveLength(0);
  });

  it('accepts the very end of today', () => {
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    expect(operationDateIssues(endOfToday)).toHaveLength(0);
  });

  it('accepts a past date', () => {
    expect(operationDateIssues(daysFromNow(-1))).toHaveLength(0);
    expect(operationDateIssues(daysFromNow(-365))).toHaveLength(0);
  });
});
