import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { showModal, showSnackbar } from '@openmrs/esm-framework';
import { deleteStockSource } from '../stock-sources.resource';
import StockSourcesDeleteActionMenu from './stock-sources-delete.component';
import DeleteConfirmation from '../../stock-user-role-scopes/delete-stock-user-scope-modal.component';
import { handleMutate } from '../../utils';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));

jest.mock('@openmrs/esm-framework', () => ({
  showModal: jest.fn(),
  showSnackbar: jest.fn(),
  restBaseUrl: 'http://localhost:8080',
}));

jest.mock('../stock-sources.resource', () => ({
  deleteStockSource: jest.fn(),
}));

jest.mock('../../utils', () => ({
  handleMutate: jest.fn(),
}));

describe('StockSourcesDeleteActionMenu', () => {
  const uuid = '1234-5678';
  const uuids: string[] = ['1234-5678'];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the delete button correctly', () => {
    const { getByRole } = render(<StockSourcesDeleteActionMenu uuid={uuid} />);
    const button = getByRole('button', { name: 'deleteSource' });
    expect(button).toBeInTheDocument();
  });

  it('opens the delete modal when the delete button is clicked', () => {
    const { getByRole } = render(<StockSourcesDeleteActionMenu uuid={uuid} />);
    const button = getByRole('button', { name: 'deleteSource' });
    fireEvent.click(button);
    expect(showModal).toHaveBeenCalledWith(
      'delete-stock-modal',
      expect.objectContaining({
        close: expect.any(Function),
        uuid: uuid,
        onConfirmation: expect.any(Function),
      }),
    );
  });

  it('calls onConfirmation when delete is clicked', () => {
    const mockOnConfirmation = jest.fn();
    const mockClose = jest.fn();

    render(<DeleteConfirmation close={mockClose} onConfirmation={mockOnConfirmation} />);

    expect(screen.getByText(/deleteStockUserScope/i)).toBeInTheDocument();

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    expect(mockOnConfirmation).toHaveBeenCalledTimes(1);
    expect(mockClose).not.toHaveBeenCalled();
  });

  it('calls deleteStockSource with the correct UUID on confirmation', async () => {
    const mockOnConfirmation = jest.fn();
    const mockClose = jest.fn();

    render(
      <DeleteConfirmation
        close={mockClose}
        onConfirmation={() => {
          mockOnConfirmation();
          deleteStockSource([uuid]);
        }}
      />,
    );

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    expect(mockOnConfirmation).toHaveBeenCalledTimes(1);
    expect(deleteStockSource).toHaveBeenCalledWith([uuid]);
  });

  it('calls handleMutate with the correct URL on successful deletion', async () => {
    (deleteStockSource as jest.Mock).mockResolvedValueOnce({});

    const mockOnConfirmation = jest.fn();
    const mockClose = jest.fn();

    render(
      <DeleteConfirmation
        close={mockClose}
        onConfirmation={async () => {
          await deleteStockSource([uuid]);
          handleMutate('/openmrs/ws/rest/v1/stocksource');
        }}
      />,
    );

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(deleteStockSource).toHaveBeenCalledWith([uuid]);
      expect(handleMutate).toHaveBeenCalledWith('/openmrs/ws/rest/v1/stocksource');
    });
  });

  it('calls showSnackbar with the correct parameters on deletion error', async () => {
    (deleteStockSource as jest.Mock).mockRejectedValueOnce(new Error('Deletion failed'));

    const mockOnConfirmation = jest.fn();
    const mockClose = jest.fn();

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

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(deleteStockSource).toHaveBeenCalledWith([uuid]);
      expect(showSnackbar).toHaveBeenCalledWith({
        title: 'stockSourceDeleteError',
        kind: 'error',
      });
    });
  });

  it('handles the error state correctly when the delete action fails', async () => {
    (deleteStockSource as jest.Mock).mockRejectedValueOnce(new Error('Deletion failed'));

    const mockOnConfirmation = jest.fn();
    const mockClose = jest.fn();

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

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(deleteStockSource).toHaveBeenCalledWith([uuid]);

      expect(showSnackbar).toHaveBeenCalledWith({
        title: 'stockSourceDeleteError',
        kind: 'error',
      });
      expect(deleteButton).toBeInTheDocument();
    });
  });
});
