import React from 'react';
import dayjs from 'dayjs';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { restBaseUrl } from '@openmrs/esm-framework';
import { useHandleMutate } from '../utils';
import { useStockInventory } from './stock-home-inventory-expiry.resource';
import { useStockInventoryItems } from './stock-home-inventory-items.resource';
import StockHomeInventoryCard from './stock-home-inventory-card.component';

vi.mock('../utils', () => ({ useHandleMutate: vi.fn() }));
vi.mock('./stock-home-inventory-expiry.resource', () => ({ useStockInventory: vi.fn() }));
vi.mock('./stock-home-inventory-items.resource', () => ({ useStockInventoryItems: vi.fn() }));

const mutate = vi.fn();
const failure = new Error('Service Unavailable');
const paracetamol = { uuid: 'item-1', drugName: 'Paracetamol 500mg', hasExpiration: true };
const expiringBatch = {
  uuid: 'batch-1',
  batchNo: 'B1',
  stockItemUuid: paracetamol.uuid,
  quantity: '20',
  expiration: dayjs().add(30, 'day').toDate(),
};

const setup = ({ batchesError, itemsError }: { batchesError?: Error; itemsError?: Error } = {}) => {
  vi.mocked(useHandleMutate).mockReturnValue(mutate);
  vi.mocked(useStockInventory).mockReturnValue({
    items: [expiringBatch],
    isLoading: false,
    error: batchesError,
  } as unknown as ReturnType<typeof useStockInventory>);
  vi.mocked(useStockInventoryItems).mockReturnValue({
    items: [paracetamol],
    isLoading: false,
    error: itemsError,
  } as unknown as ReturnType<typeof useStockInventoryItems>);
  render(<StockHomeInventoryCard />);
};

describe('StockHomeInventoryCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lists the expiring batches when everything loads', () => {
    setup();

    expect(screen.getByText(/B1/)).toBeInTheDocument();
    expect(screen.queryByText("Couldn't load inventory alerts")).not.toBeInTheDocument();
  });

  it('shows an error, not the alerts loaded earlier, when the batches fail to load', async () => {
    setup({ batchesError: failure });

    expect(screen.getByText("Couldn't load inventory alerts")).toBeInTheDocument();
    expect(screen.queryByText(/B1/)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'View All' })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(mutate).toHaveBeenCalledWith(`${restBaseUrl}/stockmanagement/stockbatch?`);
  });

  it('shows an error when the stock items fail to load', async () => {
    setup({ itemsError: failure });

    expect(screen.getByText("Couldn't load inventory alerts")).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(mutate).toHaveBeenCalledWith(`${restBaseUrl}/stockmanagement/stockitem?`);
  });

  it('keeps the error and Try again when Escape is pressed', async () => {
    setup({ batchesError: failure });

    screen.getByRole('button', { name: 'Try again' }).focus();
    await userEvent.keyboard('{Escape}');

    expect(screen.getByText("Couldn't load inventory alerts")).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
  });
});
