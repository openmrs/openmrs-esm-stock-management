import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import StockOperationsModal from './stock-operations.modal';
import { executeStockOperationAction } from '../stock-operations.resource';
import { type StockOperationDTO } from '../../core/api/types/stockOperation/StockOperationDTO';

vi.mock('../stock-operations.resource', () => ({
  executeStockOperationAction: vi.fn().mockResolvedValue({}),
}));

vi.mock('../../utils', () => ({
  useHandleMutate: () => vi.fn(),
}));

describe('StockOperationsModal', () => {
  it('does not submit Cancel without a non-whitespace reason', async () => {
    const user = userEvent.setup();
    render(
      <StockOperationsModal
        title="Cancel"
        requireReason
        operation={{ uuid: 'operation-uuid' } as StockOperationDTO}
        closeModal={vi.fn()}
      />,
    );

    await user.type(screen.getByRole('textbox'), '   ');
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(screen.getByText('Required')).toBeInTheDocument();
    expect(executeStockOperationAction).not.toHaveBeenCalled();

    await user.clear(screen.getByRole('textbox'));
    await user.type(screen.getByRole('textbox'), 'Duplicate request');
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() =>
      expect(executeStockOperationAction).toHaveBeenCalledWith({
        name: 'CANCEL',
        uuid: 'operation-uuid',
        reason: 'Duplicate request',
      }),
    );
  });

  it('submits without a reason when none is required', async () => {
    const user = userEvent.setup();
    render(
      <StockOperationsModal
        title="Approve"
        requireReason={false}
        operation={{ uuid: 'operation-uuid' } as StockOperationDTO}
        closeModal={vi.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() =>
      expect(executeStockOperationAction).toHaveBeenCalledWith({
        name: 'APPROVE',
        uuid: 'operation-uuid',
        reason: '',
      }),
    );
  });
});
