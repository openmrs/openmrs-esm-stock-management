import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type StockItemDTO } from '../../core/api/types/stockItem/StockItem';
import {
  createStockItem,
  createStockItemPackagingUnit,
  updateStockItem,
  updateStockItemPackagingUnit,
} from '../stock-items.resource';
import { launchAddOrEditStockItemWorkspace } from '../stock-item.utils';
import { useStockItemPackageUnitsHook } from './packaging-units/packaging-units.resource';
import PackagingUnits from './packaging-units/packaging-units.component';
import StockItemDetails from './stock-item-details/stock-item-details.component';

vi.mock('../stock-items.resource', () => ({
  createStockItem: vi.fn(),
  updateStockItem: vi.fn(),
  createStockItemPackagingUnit: vi.fn(),
  updateStockItemPackagingUnit: vi.fn(),
}));
vi.mock('../stock-item.utils', () => ({ launchAddOrEditStockItemWorkspace: vi.fn() }));
vi.mock('../../utils', () => ({ useHandleMutate: vi.fn(() => vi.fn()) }));
vi.mock('./packaging-units/packaging-units.resource', () => ({ useStockItemPackageUnitsHook: vi.fn() }));
// Stand-ins for the pickers that fill in their field, as choosing an option would
vi.mock('./drug-selector/drug-selector.component', async () => ({
  default: (await import('./stock-item-tabs-after-save.test-utils')).createFieldFiller('drug-uuid'),
}));
vi.mock('./concepts-selector/concepts-selector.component', () => ({ default: () => null }));
vi.mock('./dispensing-unit-selector/dispensing-unit-selector.component', async () => ({
  default: (await import('./stock-item-tabs-after-save.test-utils')).createFieldFiller('unit-uuid'),
}));
vi.mock('./preferred-vendor-selector/preferred-vendor-selector.component', () => ({ default: () => null }));
vi.mock('./stock-item-category-selector/stock-item-category-selector.component', () => ({ default: () => null }));
vi.mock('./stock-item-units-edit/stock-item-units-edit.component', () => ({ default: () => null }));
vi.mock('./packaging-units-concept-selector/packaging-units-concept-selector.component', () => ({
  default: () => null,
}));

const savedItem = {
  uuid: 'item-uuid',
  isDrug: true,
  drugUuid: 'drug-uuid',
  drugName: 'Advil 200mg',
  dispensingUnitUuid: 'unit-uuid',
  hasExpiration: false,
  commonName: 'Ibuprofen',
} as unknown as StockItemDTO;

describe('stock item workspace tabs after a save', () => {
  beforeEach(() => {
    vi.mocked(updateStockItem).mockResolvedValue({ data: savedItem } as never);
    vi.mocked(createStockItem).mockResolvedValue({ data: { ...savedItem } } as never);
    vi.mocked(updateStockItemPackagingUnit).mockResolvedValue({} as never);
    vi.mocked(createStockItemPackagingUnit).mockResolvedValue({} as never);
  });

  it('stays on Details after saving an existing item', async () => {
    const user = userEvent.setup();
    const handleTabChange = vi.fn();
    render(<StockItemDetails stockItem={savedItem} handleTabChange={handleTabChange} />);

    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => expect(updateStockItem).toHaveBeenCalled());
    expect(handleTabChange).not.toHaveBeenCalled();
    expect(launchAddOrEditStockItemWorkspace).not.toHaveBeenCalled();
  });

  it('moves a new item on to Packaging Units in the edit workspace', async () => {
    const user = userEvent.setup();
    const handleTabChange = vi.fn();
    render(<StockItemDetails handleTabChange={handleTabChange} />);

    await user.click(screen.getByRole('radio', { name: /^pharmaceuticals/i }));
    await user.click(screen.getByRole('radio', { name: /^no$/i }));
    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => expect(createStockItem).toHaveBeenCalled());
    expect(launchAddOrEditStockItemWorkspace).toHaveBeenCalledWith(expect.objectContaining({ uuid: 'item-uuid' }));
    expect(handleTabChange).toHaveBeenCalledWith(1);
  });

  it('stays on Packaging Units after saving a packaging unit', async () => {
    const user = userEvent.setup();
    const handleTabChange = vi.fn();
    vi.mocked(useStockItemPackageUnitsHook).mockReturnValue({
      items: [{ uuid: 'unit-uuid', packagingUomName: 'Box', factor: 10, stockItemUuid: 'item-uuid' }],
      isLoading: false,
      setStockItemUuid: vi.fn(),
      mutate: vi.fn(),
    } as never);
    render(<PackagingUnits stockItemUuid="item-uuid" handleTabChange={handleTabChange} />);

    const factor = screen.getAllByRole('spinbutton')[0];
    await user.clear(factor);
    await user.type(factor, '20');
    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => expect(updateStockItemPackagingUnit).toHaveBeenCalled());
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(handleTabChange).not.toHaveBeenCalled();
  });
});
