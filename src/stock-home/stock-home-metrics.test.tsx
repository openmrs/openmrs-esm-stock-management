import React from 'react';
import dayjs from 'dayjs';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { restBaseUrl } from '@openmrs/esm-framework';
import { useHandleMutate } from '../utils';
import { useDisposalList } from './useDisposalList';
import { useStockInventory } from './stock-home-inventory-expiry.resource';
import { useStockInventoryItems } from './stock-home-inventory-items.resource';
import useStockList from './useStockList';
import StockManagementMetrics from './stock-home-metrics.component';

vi.mock('../utils', () => ({ useHandleMutate: vi.fn() }));
vi.mock('./useDisposalList', () => ({ useDisposalList: vi.fn() }));
vi.mock('./stock-home-inventory-expiry.resource', () => ({ useStockInventory: vi.fn() }));
vi.mock('./stock-home-inventory-items.resource', () => ({ useStockInventoryItems: vi.fn() }));
vi.mock('./useStockList', () => ({ default: vi.fn() }));

const mutate = vi.fn();
const failure = new Error('Service Unavailable');
const paracetamol = { uuid: 'item-1', drugName: 'Paracetamol', hasExpiration: true, expiryNotice: 180 };
const expiringBatch = {
  uuid: 'batch-1',
  batchNo: 'B1',
  stockItemUuid: paracetamol.uuid,
  expiration: dayjs().add(30, 'day').toDate(),
};

type Errors = { batches?: Error; items?: Error; stockList?: Error; disposals?: Error };

const setup = (errors: Errors = {}) => {
  vi.mocked(useHandleMutate).mockReturnValue(mutate);
  vi.mocked(useStockInventory).mockReturnValue({
    items: [expiringBatch],
    isLoading: false,
    error: errors.batches,
  } as unknown as ReturnType<typeof useStockInventory>);
  vi.mocked(useStockInventoryItems).mockReturnValue({
    items: [paracetamol],
    isLoading: false,
    error: errors.items,
  } as unknown as ReturnType<typeof useStockInventoryItems>);
  vi.mocked(useStockList).mockReturnValue({
    stockList: [paracetamol],
    isLoading: false,
    error: errors.stockList,
  } as unknown as ReturnType<typeof useStockList>);
  vi.mocked(useDisposalList).mockReturnValue({
    items: [],
    isLoading: false,
    error: errors.disposals,
  } as unknown as ReturnType<typeof useDisposalList>);
  render(<StockManagementMetrics />);
};

// Each tile has labels of its own: "In 6 months" (Expiring), "Understocked items" (Out of stock) and "Expired" (Disposed).
const expectTiles = ({
  expiring,
  outOfStock,
  disposed,
}: {
  expiring: boolean;
  outOfStock: boolean;
  disposed: boolean;
}) => {
  const shown = (visible: boolean, label: string) =>
    visible
      ? expect(screen.getByText(label)).toBeInTheDocument()
      : expect(screen.queryByText(label)).not.toBeInTheDocument();
  shown(expiring, 'In 6 months');
  shown(outOfStock, 'Understocked items');
  shown(disposed, 'Expired');
};

describe('StockManagementMetrics', () => {
  it("shows each tile's counts when everything loads", () => {
    setup();

    expectTiles({ expiring: true, outOfStock: true, disposed: true });
    expect(screen.queryByText("Couldn't load")).not.toBeInTheDocument();
  });

  it('shows an error instead of the counts on the Expiring stock tile when the batches fail to load', async () => {
    // SWR keeps the last data when a reload fails, so the hook returns the old batches as well as the error.
    setup({ batches: failure });

    expect(screen.getAllByText("Couldn't load")).toHaveLength(1);
    expectTiles({ expiring: false, outOfStock: true, disposed: true });

    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(mutate).toHaveBeenCalledWith(`${restBaseUrl}/stockmanagement/stockbatch?`);
    expect(mutate).toHaveBeenCalledTimes(1);
  });

  it('shows an error on the Expiring stock tile when the stock items fail to load', async () => {
    setup({ items: failure });

    expect(screen.getAllByText("Couldn't load")).toHaveLength(1);
    expectTiles({ expiring: false, outOfStock: true, disposed: true });

    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(mutate).toHaveBeenCalledWith(`${restBaseUrl}/stockmanagement/stockitem?`);
  });

  it('shows an error on the Out of stock tile only when the item list fails to load', async () => {
    setup({ stockList: failure });

    expect(screen.getAllByText("Couldn't load")).toHaveLength(1);
    expectTiles({ expiring: true, outOfStock: false, disposed: true });

    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(mutate).toHaveBeenCalledWith(`${restBaseUrl}/stockmanagement/stockitem?`);
  });

  it('shows an error on the Disposed stock tile only when the operations fail to load', async () => {
    setup({ disposals: failure });

    expect(screen.getAllByText("Couldn't load")).toHaveLength(1);
    expectTiles({ expiring: true, outOfStock: true, disposed: false });

    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(mutate).toHaveBeenCalledWith(`${restBaseUrl}/stockmanagement/stockoperation?`);
  });

  it('keeps the error and Try again on a tile when Escape is pressed', async () => {
    setup({ disposals: failure });

    screen.getByRole('button', { name: 'Try again' }).focus();
    await userEvent.keyboard('{Escape}');

    expect(screen.getAllByText("Couldn't load")).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
  });
});
