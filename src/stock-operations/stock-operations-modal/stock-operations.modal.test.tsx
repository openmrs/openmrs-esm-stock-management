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
    await user.click(screen.getByRole('button', { name: /cancel operation/i }));

    expect(screen.getByText('Required')).toBeInTheDocument();
    expect(executeStockOperationAction).not.toHaveBeenCalled();

    await user.clear(screen.getByRole('textbox'));
    await user.type(screen.getByRole('textbox'), 'Duplicate request');
    await user.click(screen.getByRole('button', { name: /cancel operation/i }));

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

    await user.click(screen.getByRole('button', { name: 'Approve' }));

    await waitFor(() =>
      expect(executeStockOperationAction).toHaveBeenCalledWith({
        name: 'APPROVE',
        uuid: 'operation-uuid',
        reason: '',
      }),
    );
  });

  it('uses a danger button named after the action for destructive actions', () => {
    render(
      <StockOperationsModal
        title="Reject"
        requireReason
        operation={{ uuid: 'operation-uuid' } as StockOperationDTO}
        closeModal={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: /reject/i })).toHaveClass('cds--btn--danger');
    expect(screen.queryByRole('button', { name: 'Submit' })).not.toBeInTheDocument();
  });

  it('uses a primary button for non-destructive actions', () => {
    render(
      <StockOperationsModal
        title="Approve"
        requireReason={false}
        operation={{ uuid: 'operation-uuid' } as StockOperationDTO}
        closeModal={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: 'Approve' })).toHaveClass('cds--btn--primary');
  });

  it('stays open when the action fails', async () => {
    const user = userEvent.setup();
    const closeModal = vi.fn();
    vi.mocked(executeStockOperationAction).mockRejectedValueOnce({
      responseBody: { error: { message: 'Not allowed' } },
    });
    render(
      <StockOperationsModal
        title="Approve"
        requireReason={false}
        operation={{ uuid: 'operation-uuid' } as StockOperationDTO}
        closeModal={closeModal}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Approve' }));

    expect(await screen.findByRole('button', { name: 'Approve' })).toBeInTheDocument();
    expect(closeModal).not.toHaveBeenCalled();
  });
});
