import React, { ReactNode } from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { useForm, FormProvider } from 'react-hook-form';
import { useStockItemBatchNos } from './batch-no-selector.resource';
import { useStockItemBatchInformationHook } from '../../stock-items/add-stock-item/batch-information/batch-information.resource';
import '@testing-library/jest-dom/extend-expect';
import { StockBatchDTO } from '../../core/api/types/stockItem/StockBatchDTO';
import BatchNoSelector from './batch-no-selector.component';

// Mock the hooks
jest.mock('./batch-no-selector.resource', () => ({
  useStockItemBatchNos: jest.fn(),
}));

jest.mock('../../stock-items/add-stock-item/batch-information/batch-information.resource', () => ({
  useStockItemBatchInformationHook: jest.fn(),
}));

describe('BatchNoSelector', () => {
  const mockBatchNos: StockBatchDTO[] = [
    {
      uuid: '1',
      batchNo: 'Batch1',
      expiration: new Date('2023-12-31'),
      stockItemUuid: 'item-uuid-1',
      quantity: '10',
      voided: false,
    },
    {
      uuid: '2',
      batchNo: 'Batch2',
      expiration: new Date('2024-12-31'),
      stockItemUuid: 'item-uuid-2',
      quantity: '20',
      voided: false,
    },
  ];

  const mockBatchInfo = [
    { batchNumber: 'Batch1', quantity: '15' },
    { batchNumber: 'Batch2', quantity: '25' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (useStockItemBatchNos as jest.Mock).mockReturnValue({
      isLoading: false,
      stockItemBatchNos: mockBatchNos,
    });

    (useStockItemBatchInformationHook as jest.Mock).mockReturnValue({
      items: mockBatchInfo,
      setStockItemUuid: jest.fn(),
    });
  });

  it('renders batch numbers correctly', async () => {
    render(<BatchNoSelector stockItemUuid="test-uuid" name="testName" title="Test Title" />);

    const comboboxButton = screen.getByRole('button', { name: /open/i });
    fireEvent.click(comboboxButton);

    await waitFor(() => {
      expect(screen.getByText('Batch1 | Qty: 15')).toBeInTheDocument();
      expect(screen.getByText('Batch2 | Qty: 25')).toBeInTheDocument();
    });
  });

  it('calls onBatchNoChanged when a batch is selected', async () => {
    const handleBatchNoChanged = jest.fn();

    render(
      <BatchNoSelector
        stockItemUuid="test-uuid"
        name="testName"
        title="Test Title"
        onBatchNoChanged={handleBatchNoChanged}
      />
    );

    const comboboxButton = screen.getByRole('button', { name: /open/i });
    fireEvent.click(comboboxButton);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Batch1' } });
    fireEvent.click(screen.getByText('Batch1 | Qty: 15'));

    await waitFor(() => {
      expect(handleBatchNoChanged).toHaveBeenCalledWith({
        uuid: '1',
        batchNo: 'Batch1',
        expiration: new Date('2023-12-31'),
        stockItemUuid: 'item-uuid-1',
        quantity: '15',
        voided: false,
      });
    });
  });

});