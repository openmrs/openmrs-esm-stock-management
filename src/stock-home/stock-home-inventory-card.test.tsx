import React from 'react';
import dayjs from 'dayjs';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useStockInventory } from './stock-home-inventory-expiry.resource';
import { useStockInventoryItems } from './stock-home-inventory-items.resource';
import StockHomeInventoryCard from './stock-home-inventory-card.component';

vi.mock('./stock-home-inventory-expiry.resource', () => ({ useStockInventory: vi.fn() }));
vi.mock('./stock-home-inventory-items.resource', () => ({ useStockInventoryItems: vi.fn() }));

describe('StockHomeInventoryCard', () => {
  it('names a non-drug item whose batch expires soon', () => {
    const gloves = { uuid: 'item-2', drugName: null, conceptName: 'Surgical gloves', hasExpiration: true };
    const batch = {
      uuid: 'batch-1',
      batchNo: 'G1',
      stockItemUuid: gloves.uuid,
      quantity: '40',
      expiration: dayjs().add(30, 'day').toDate(),
    };
    vi.mocked(useStockInventoryItems).mockReturnValue({
      items: [gloves],
      isLoading: false,
      error: undefined,
    } as unknown as ReturnType<typeof useStockInventoryItems>);
    vi.mocked(useStockInventory).mockReturnValue({
      items: [batch],
      isLoading: false,
      error: undefined,
    } as unknown as ReturnType<typeof useStockInventory>);

    render(<StockHomeInventoryCard />);

    expect(screen.getByText('Surgical gloves')).toBeInTheDocument();
    expect(screen.getByText(/G1/)).toBeInTheDocument();
  });
});
