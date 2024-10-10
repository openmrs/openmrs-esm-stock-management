import React from 'react';
import { render, screen } from '@testing-library/react';
import { useForm, FormProvider } from 'react-hook-form';
import { useStockItemBatchNos } from './batch-no-selector.resource';
import { useStockItemBatchInformationHook } from '../../stock-items/add-stock-item/batch-information/batch-information.resource';
import BatchNoSelector from './batch-no-selector.component';
import { StockBatchDTO } from '../../core/api/types/stockItem/StockBatchDTO';
import userEvent from '@testing-library/user-event';
import { waitFor } from '@testing-library/react';

// Mock hooks
jest.mock('./batch-no-selector.resource');
jest.mock('../../stock-items/add-stock-item/batch-information/batch-information.resource');
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const mockUseStockItemBatchNos = useStockItemBatchNos as jest.Mock;
const mockUseStockItemBatchInformationHook = useStockItemBatchInformationHook as jest.Mock;

describe('BatchNoSelector Component', () => {
  const stockItemUuid = 'test-uuid';
  const batchUuid = 'batch-uuid';
  const mockStockItemBatchNos: StockBatchDTO[] = [
    { uuid: '1', batchNo: 'batch1', quantity: '10', expiration: new Date(), stockItemUuid: '', voided: false },
    { uuid: '2', batchNo: 'batch2', quantity: '20', expiration: new Date(), stockItemUuid: '', voided: false },
  ];
  const mockBatchInformation = [
    { batchNumber: 'batch1', quantity: '10' },
    { batchNumber: 'batch2', quantity: '20' },
  ];

  beforeEach(() => {
    mockUseStockItemBatchNos.mockReturnValue({
      isLoading: false,
      stockItemBatchNos: mockStockItemBatchNos,
    });
    mockUseStockItemBatchInformationHook.mockReturnValue({
      items: mockBatchInformation,
      setStockItemUuid: jest.fn(),
    });
  });

  const renderComponent = () => {
    const Wrapper = () => {
      const methods = useForm();
      return (
        <FormProvider {...methods}>
          <BatchNoSelector
            stockItemUuid={stockItemUuid}
            batchUuid={batchUuid}
            controllerName="batchNo"
            name="batchNo"
            control={methods.control}
          />
        </FormProvider>
      );
    };
    render(<Wrapper />);
  };

  test('should render without crashing', () => {
    renderComponent();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  test('should display loading state when isLoading is true', () => {
    mockUseStockItemBatchNos.mockReturnValueOnce({
      isLoading: true,
      stockItemBatchNos: [],
    });
    renderComponent();
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  test('should call onBatchNoChanged when a batch is selected', async () => {
    const onBatchNoChanged = jest.fn();
    const Wrapper = () => {
      const methods = useForm();
      return (
        <FormProvider {...methods}>
          <BatchNoSelector
            stockItemUuid={stockItemUuid}
            batchUuid={batchUuid}
            controllerName="batchNo"
            name="batchNo"
            control={methods.control}
            onBatchNoChanged={onBatchNoChanged}
          />
        </FormProvider>
      );
    };
    render(<Wrapper />);

    const combobox = screen.getByRole('combobox');
    await userEvent.click(combobox);
    await userEvent.click(screen.getByText((content) => content.includes('batch1')));

    expect(onBatchNoChanged).toHaveBeenCalledWith(mockStockItemBatchNos[0]);
  });
});
