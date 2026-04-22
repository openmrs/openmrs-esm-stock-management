import {
  DATE_PICKER_CONTROL_FORMAT,
  DATE_PICKER_FORMAT,
  formatBatchExpiryDate,
  formatDisplayDate,
  formatDisplayDateTime,
  formatForDatePicker,
  isDateAfterToday,
  ParseDate,
  today,
} from './datetimeUtils';

// Fixed reference date used across time-sensitive tests: 15 June 2023 at 10:30:45
const FIXED_DATE = new Date(2023, 5, 15, 10, 30, 45);

describe('formatDisplayDate', () => {
  it('formats a date using the default DD-MMM-YYYY format', () => {
    expect(formatDisplayDate(new Date(2023, 0, 15))).toBe('15-Jan-2023');
  });

  it('formats a date using a custom format when provided', () => {
    expect(formatDisplayDate(new Date(2023, 0, 15), 'YYYY/MM/DD')).toBe('2023/01/15');
  });

  it('returns an empty string for null', () => {
    expect(formatDisplayDate(null)).toBe('');
  });

  it('returns an empty string for undefined', () => {
    expect(formatDisplayDate(undefined)).toBe('');
  });
});

describe('formatBatchExpiryDate', () => {
  it('formats a date using the default YYYY-MMM format', () => {
    expect(formatBatchExpiryDate(new Date(2024, 5, 1))).toBe('2024-Jun');
  });

  it('formats a date using a custom format when provided', () => {
    expect(formatBatchExpiryDate(new Date(2024, 5, 1), 'MM/YYYY')).toBe('06/2024');
  });

  it('returns an empty string for null', () => {
    expect(formatBatchExpiryDate(null)).toBe('');
  });

  it('returns an empty string for undefined', () => {
    expect(formatBatchExpiryDate(undefined)).toBe('');
  });
});

describe('formatDisplayDateTime', () => {
  it('formats a date using the default DD-MMM-YYYY HH:mm format', () => {
    expect(formatDisplayDateTime(new Date(2023, 0, 15, 14, 30))).toBe('15-Jan-2023 14:30');
  });

  it('formats a date using a custom format when provided', () => {
    expect(formatDisplayDateTime(new Date(2023, 0, 15, 14, 30), 'HH:mm DD/MM/YYYY')).toBe('14:30 15/01/2023');
  });

  it('returns an empty string for null', () => {
    expect(formatDisplayDateTime(null)).toBe('');
  });

  it('returns an empty string for undefined', () => {
    expect(formatDisplayDateTime(undefined)).toBe('');
  });
});

describe('DATE_PICKER_FORMAT', () => {
  it('is DD/MM/YYYY', () => {
    expect(DATE_PICKER_FORMAT).toBe('DD/MM/YYYY');
  });
});

describe('DATE_PICKER_CONTROL_FORMAT', () => {
  it('is d/m/Y', () => {
    expect(DATE_PICKER_CONTROL_FORMAT).toBe('d/m/Y');
  });
});

describe('formatForDatePicker', () => {
  it('formats a date as DD/MM/YYYY', () => {
    expect(formatForDatePicker(new Date(2023, 0, 5))).toBe('05/01/2023');
  });

  it('returns an empty string for null', () => {
    expect(formatForDatePicker(null)).toBe('');
  });

  it('returns an empty string for undefined', () => {
    expect(formatForDatePicker(undefined)).toBe('');
  });
});

describe('today', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(FIXED_DATE);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns a date matching the current calendar day', () => {
    const result = today();
    expect(result.getFullYear()).toBe(2023);
    expect(result.getMonth()).toBe(5); // June (0-indexed)
    expect(result.getDate()).toBe(15);
  });

  it('returns midnight (00:00:00) regardless of the current time', () => {
    const result = today();
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
  });
});

describe('isDateAfterToday', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2023, 5, 15)); // 15 June 2023 midnight
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns true for a date strictly after today', () => {
    expect(isDateAfterToday(new Date(2023, 5, 16))).toBe(true);
  });

  it('returns false for a date strictly before today', () => {
    expect(isDateAfterToday(new Date(2023, 5, 14))).toBe(false);
  });

  it('returns false for today (same day is not after today)', () => {
    expect(isDateAfterToday(new Date(2023, 5, 15))).toBe(false);
  });

  it('returns false for null', () => {
    expect(isDateAfterToday(null)).toBe(false);
  });

  it('returns false for undefined', () => {
    expect(isDateAfterToday(undefined)).toBe(false);
  });

  it('coerces a string date and compares correctly', () => {
    // The function explicitly handles string inputs by converting them with new Date()
    const futureDate = '2023-06-20';
    expect(isDateAfterToday(futureDate as unknown as Date)).toBe(true);
  });
});

describe('ParseDate', () => {
  it('returns null for null input', () => {
    expect(ParseDate(null)).toBeNull();
  });

  it('returns null for undefined input', () => {
    expect(ParseDate(undefined)).toBeNull();
  });

  it('returns null for an empty string', () => {
    expect(ParseDate('')).toBeNull();
  });

  it.each([
    ['15-Jan-2023', 0],
    ['01-Feb-2023', 1],
    ['01-Mar-2023', 2],
    ['01-Apr-2023', 3],
    ['01-May-2023', 4],
    ['01-Jun-2023', 5],
    ['01-Jul-2023', 6],
    ['01-Aug-2023', 7],
    ['01-Sep-2023', 8],
    ['01-Oct-2023', 9],
    ['01-Nov-2023', 10],
    ['01-Dec-2023', 11],
  ])('parses %s and returns month index %i', (input, expectedMonth) => {
    const result = ParseDate(input);
    expect(result).not.toBeNull();
    expect(result?.getMonth()).toBe(expectedMonth);
    expect(result?.getFullYear()).toBe(2023);
  });

  it('parses the day component correctly', () => {
    const result = ParseDate('20-Mar-2024');
    expect(result).not.toBeNull();
    expect(result?.getDate()).toBe(20);
  });

  it('parses the year component correctly', () => {
    const result = ParseDate('01-Jan-2025');
    expect(result).not.toBeNull();
    expect(result?.getFullYear()).toBe(2025);
  });

  it('is case-insensitive for month names', () => {
    const lower = ParseDate('01-jan-2023');
    const upper = ParseDate('01-JAN-2023');
    const mixed = ParseDate('01-Jan-2023');

    expect(lower?.getMonth()).toBe(0);
    expect(upper?.getMonth()).toBe(0);
    expect(mixed?.getMonth()).toBe(0);
  });

  it('sets the time to midnight (00:00) for parsed dates', () => {
    const result = ParseDate('15-Jun-2023');
    expect(result?.getHours()).toBe(0);
    expect(result?.getMinutes()).toBe(0);
  });
});
