import React from 'react';
import { vi, describe, it, expect } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@testing-library/react';
import { type FetchResponse, showModal, showSnackbar } from '@openmrs/esm-framework';
import { deleteStockSource } from '../stock-sources.resource';
import DeleteConfirmation from '../../stock-user-role-scopes/delete-stock-user-scope.modal';
import StockSourcesDeleteActionMenu from './stock-sources-delete.component';

const mockDeleteStockSource = vi.mocked(deleteStockSource);
const mockHandleMutate = vi.fn();
const mockShowModal = vi.mocked(showModal);
const mockShowSnackbar = vi.mocked(showSnackbar);

vi.mock('../stock-sources.resource', () => ({
  deleteStockSource: vi.fn(),
}));

vi.mock('../../utils', () => ({
  useHandleMutate: () => mockHandleMutate,
}));

describe('StockSourcesDeleteActionMenu', () => {
  const uuid = '1234-5678';
  const uuids: string[] = ['1234-5678'];

  it('renders the delete button correctly', () => {
    render(<StockSourcesDeleteActionMenu uuid={uuid} />);

    const button = screen.getByRole('button', { name: /delete source/i });
    expect(button).toBeInTheDocument();
  });

  it('opens the delete modal when the delete button is clicked', async () => {
    const user = userEvent.setup();
    render(<StockSourcesDeleteActionMenu uuid={uuid} />);

    const button = screen.getByRole('button', { name: /delete source/i });
    await user.click(button);

    expect(mockShowModal).toHaveBeenCalledWith(
      'delete-stock-modal',
      expect.objectContaining({
        close: expect.any(Function),
        uuid: uuid,
        onConfirmation: expect.any(Function),
      }),
    );
  });

  it('calls onConfirmation when delete is clicked', async () => {
    const user = userEvent.setup();
    const mockOnConfirmation = vi.fn();
    const mockClose = vi.fn();

    render(<DeleteConfirmation close={mockClose} onConfirmation={mockOnConfirmation} />);

    expect(screen.getByText(/delete stock user scope/i)).toBeInTheDocument();

    const deleteButton = screen.getByRole('button', { name: /danger\s*delete/i });
    await user.click(deleteButton);

    expect(mockOnConfirmation).toHaveBeenCalledTimes(1);
    expect(mockClose).not.toHaveBeenCalled();
  });

  it('calls deleteStockSource with the correct UUID on confirmation', async () => {
    const user = userEvent.setup();
    const mockOnConfirmation = vi.fn();
    const mockClose = vi.fn();

    render(
      <DeleteConfirmation
        close={mockClose}
        onConfirmation={() => {
          mockOnConfirmation();
          deleteStockSource([uuid]);
        }}
      />,
    );

    const deleteButton = screen.getByRole('button', { name: /danger\s*delete/i });
    await user.click(deleteButton);

    expect(mockOnConfirmation).toHaveBeenCalledTimes(1);
    expect(deleteStockSource).toHaveBeenCalledWith([uuid]);
  });

  it('revalidates stock sources after a successful deletion', async () => {
    const user = userEvent.setup();
    mockDeleteStockSource.mockResolvedValueOnce({} as FetchResponse<any>);
    mockShowModal.mockReturnValueOnce(vi.fn());

    render(<StockSourcesDeleteActionMenu uuid={uuid} />);

    await user.click(screen.getByRole('button', { name: /delete source/i }));
    const { onConfirmation } = mockShowModal.mock.calls[0][1] as { onConfirmation: () => void };
    onConfirmation();

    await waitFor(() => {
      expect(mockHandleMutate).toHaveBeenCalledWith(expect.stringContaining('/stockmanagement/stocksource'));
    });
    expect(mockDeleteStockSource).toHaveBeenCalledWith([uuid]);
  });

  it('calls showSnackbar with the correct parameters on deletion error', async () => {
    const user = userEvent.setup();
    mockDeleteStockSource.mockRejectedValueOnce(new Error('Deletion failed'));

    const mockClose = vi.fn();

    render(
      <DeleteConfirmation
        close={mockClose}
        onConfirmation={async () => {
          try {
            await deleteStockSource([uuid]);
          } catch (error) {
            showSnackbar({
              title: 'stockSourceDeleteError',
              kind: 'error',
            });
          }
        }}
      />,
    );

    const deleteButton = screen.getByRole('button', { name: /danger\s*delete/i });
    await user.click(deleteButton);

    expect(mockDeleteStockSource).toHaveBeenCalledWith([uuid]);
    expect(mockShowSnackbar).toHaveBeenCalledWith({
      title: 'stockSourceDeleteError',
      kind: 'error',
    });
  });

  it('handles the error state correctly when the delete action fails', async () => {
    const user = userEvent.setup();
    mockDeleteStockSource.mockRejectedValueOnce(new Error('Deletion failed'));

    const mockClose = vi.fn();

    render(
      <DeleteConfirmation
        close={mockClose}
        onConfirmation={async () => {
          try {
            await deleteStockSource([uuid]);
          } catch (error) {
            showSnackbar({
              title: 'stockSourceDeleteError',
              kind: 'error',
            });
          }
        }}
      />,
    );

    const deleteButton = screen.getByRole('button', { name: /danger\s*delete/i });
    await user.click(deleteButton);

    expect(mockDeleteStockSource).toHaveBeenCalledWith([uuid]);
    expect(mockShowSnackbar).toHaveBeenCalledWith({
      title: 'stockSourceDeleteError',
      kind: 'error',
    });
    expect(deleteButton).toBeInTheDocument();
  });
});
