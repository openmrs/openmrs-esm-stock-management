import React from 'react';
import { render, screen } from '@testing-library/react';
import { useForm, FormProvider } from 'react-hook-form';
import BatchNoSelector from './batch-no-selector.component';
import userEvent from '@testing-library/user-event';
import { waitFor } from '@testing-library/react';
import { StockBatchDTO } from '../../../core/api/types/stockItem/StockBatchDTO';
import { useStockItemBatchNos } from '../../batch-no-selector/batch-no-selector.resource';
import { useStockItemBatchInformationHook } from '../../../stock-items/add-stock-item/batch-information/batch-information.resource';

// Mock hooks
jest.mock('./batch-no-selector.resource');
jest.mock('../../stock-items/add-stock-item/batch-information/batch-information.resource');
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const mockUseStockItemBatchNos = useStockItemBatchNos as jest.Mock;
const mockUseStockItemBatchInformationHook = useStockItemBatchInformationHook as jest.Mock;
