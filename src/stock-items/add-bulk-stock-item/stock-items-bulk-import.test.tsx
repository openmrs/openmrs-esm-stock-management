import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ImportDialogPopup from './stock-items-bulk-import.component';
import { showSnackbar } from '@openmrs/esm-framework';
import { UploadStockItems } from './stock-items-bulk-import.resource';

jest.mock('@openmrs/esm-framework', () => ({
  showSnackbar: jest.fn(),
}));

jest.mock('./stock-items-bulk-import.resource', () => ({
  UploadStockItems: jest.fn(),
}));

describe('ImportDialogPopup', () => {
  const mockCloseModal = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with initial state and UI elements', () => {
    render(<ImportDialogPopup closeModal={mockCloseModal} />);

    expect(screen.getByText('Import Stock Items')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Select file' })).toBeInTheDocument();
    expect(screen.getByText('Only .csv files at 2mb or less')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Upload StockItems' })).toBeInTheDocument();
  });

  it('allows only CSV files', async () => {
    render(<ImportDialogPopup closeModal={mockCloseModal} />);

    const fileInput = screen.getByLabelText('Select file') as HTMLInputElement;
    expect(fileInput.accept).toBe('.csv');
  });

  it('closes modal when cancel button is clicked', async () => {
    render(<ImportDialogPopup closeModal={mockCloseModal} />);

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await userEvent.click(cancelButton);

    expect(mockCloseModal).toHaveBeenCalledTimes(1);
  });

  it('does nothing when upload is clicked without a file', async () => {
    render(<ImportDialogPopup closeModal={mockCloseModal} />);

    const uploadButton = screen.getByRole('button', { name: 'Upload StockItems' });
    await userEvent.click(uploadButton);

    expect(UploadStockItems).not.toHaveBeenCalled();
    expect(showSnackbar).not.toHaveBeenCalled();
    expect(mockCloseModal).not.toHaveBeenCalled();
  });

  it('uploads file successfully and shows success snackbar', async () => {
    (UploadStockItems as jest.Mock).mockResolvedValue({});
    render(<ImportDialogPopup closeModal={mockCloseModal} />);

    const validFile = new File(['test content'], 'valid.csv', { type: 'text/csv' });
    const fileInput = screen.getByLabelText('Select file') as HTMLInputElement;
    await userEvent.upload(fileInput, validFile);

    const uploadButton = screen.getByRole('button', { name: 'Upload StockItems' });
    await userEvent.click(uploadButton);

    await waitFor(() => expect(UploadStockItems).toHaveBeenCalled());
    await waitFor(() =>
      expect(showSnackbar).toHaveBeenCalledWith(
        expect.objectContaining({
          kind: 'success',
          title: 'Uploaded Order',
        }),
      ),
    );
    await waitFor(() => expect(mockCloseModal).toHaveBeenCalledTimes(1));
  });

  it('shows error snackbar on upload failure', async () => {
    (UploadStockItems as jest.Mock).mockRejectedValue(new Error('Upload failed'));
    render(<ImportDialogPopup closeModal={mockCloseModal} />);

    const validFile = new File(['test content'], 'valid.csv', { type: 'text/csv' });
    const fileInput = screen.getByLabelText('Select file') as HTMLInputElement;
    await userEvent.upload(fileInput, validFile);

    const uploadButton = screen.getByRole('button', { name: 'Upload StockItems' });
    await userEvent.click(uploadButton);

    await waitFor(() => expect(UploadStockItems).toHaveBeenCalled());
    await waitFor(() =>
      expect(showSnackbar).toHaveBeenCalledWith(
        expect.objectContaining({
          kind: 'error',
          title: 'An error occurred uploading stock items',
        }),
      ),
    );
    await waitFor(() => expect(mockCloseModal).not.toHaveBeenCalled());
  });
});
