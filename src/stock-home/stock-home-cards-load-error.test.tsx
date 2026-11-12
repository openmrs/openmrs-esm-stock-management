import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useStockOperations } from '../stock-operations/stock-operations.resource';
import StockHomeIssuingCard from './stock-home-issuing-card.component';
import StockHomeReceivingCard from './stock-home-receiving-card.component';

const mockHandleMutate = vi.fn();

vi.mock('../stock-operations/stock-operations.resource', () => ({ useStockOperations: vi.fn() }));
vi.mock('../utils', () => ({ useHandleMutate: () => mockHandleMutate }));

const receipt = {
  uuid: 'receipt-uuid',
  operationType: 'receipt',
  status: 'NEW',
  sourceName: 'Supplier',
  destinationName: 'Main Store',
  stockOperationItems: [{ stockItemName: 'Paracetamol', stockItemPackagingUOMName: 'Tablet', quantity: 5 }],
};

describe.each([
  ['Receiving', StockHomeReceivingCard, "Couldn't load received stock"],
  ['Issuing', StockHomeIssuingCard, "Couldn't load issued stock"],
])('The Overview %s card', (_, Card, errorTitle) => {
  beforeEach(() => mockHandleMutate.mockClear());

  it('shows an error with a retry when the operations fail to load', async () => {
    const user = userEvent.setup();
    vi.mocked(useStockOperations).mockReturnValue({
      items: undefined,
      isLoading: false,
      error: new Error('Service Unavailable'),
    } as never);
    render(<Card />);

    expect(screen.getByRole('alert')).toHaveTextContent(errorTitle);
    expect(screen.queryByRole('button', { name: 'View All' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Try again' }));

    expect(mockHandleMutate).toHaveBeenCalledWith(expect.stringMatching(/\/stockmanagement\/stockoperation\?$/));
  });

  it('shows the error when a reload fails, even with data from an earlier load', () => {
    vi.mocked(useStockOperations).mockReturnValue({
      items: { results: [receipt, { ...receipt, uuid: 'issue-uuid', operationType: 'stockissue' }] },
      isLoading: false,
      error: new Error('Service Unavailable'),
    } as never);
    render(<Card />);

    expect(screen.getByRole('alert')).toHaveTextContent(errorTitle);
    expect(screen.queryByText('Paracetamol')).not.toBeInTheDocument();
  });

  it('shows no error when the operations load', () => {
    vi.mocked(useStockOperations).mockReturnValue({
      items: { results: [] },
      isLoading: false,
      error: null,
    } as never);
    render(<Card />);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
