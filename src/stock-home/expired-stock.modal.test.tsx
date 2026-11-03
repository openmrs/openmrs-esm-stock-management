import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ExpiredStockModal from './expired-stock.modal';

const expiredStock = [{ drugName: 'Paracetamol', batchNo: 'B1', quantity: 5, expiration: '2026-01-15T12:00:00.000Z' }];

describe('ExpiredStockModal', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it.each([
    ['en', /Jan/],
    ['fr', /janv/],
  ])("formats expiration dates in the user's locale (%s)", (language, expected) => {
    vi.stubGlobal('i18next', { language });

    render(<ExpiredStockModal closeModal={vi.fn()} expiredStock={expiredStock} />);

    expect(screen.getByRole('cell', { name: expected })).toBeInTheDocument();
  });
});
