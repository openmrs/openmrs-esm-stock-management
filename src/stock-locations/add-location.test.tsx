import React from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect } from 'vitest';
import { showSnackbar } from '@openmrs/esm-framework';
import { saveLocation } from './stock-locations-table.resource';
import NewLocationModal from './add-location.modal';

vi.mock('./stock-locations-table.resource', () => ({
  saveLocation: vi.fn(),
  useLocationTags: () => ({ locationTagList: [] }),
}));

describe('create location modal', () => {
  it('submits the form from the separate modal footer and refreshes after saving', async () => {
    const user = userEvent.setup();
    vi.mocked(saveLocation).mockResolvedValueOnce({ data: { name: 'Dispensary' } } as Awaited<
      ReturnType<typeof saveLocation>
    >);
    const close = vi.fn(),
      mutate = vi.fn();
    render(<NewLocationModal close={close} mutate={mutate} />);
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
    await user.type(screen.getByRole('textbox', { name: 'Location name' }), 'Dispensary');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() =>
      expect(saveLocation).toHaveBeenCalledWith({ locationPayload: { name: 'Dispensary', tags: [] } }),
    );
    await waitFor(() => expect(mutate).toHaveBeenCalledOnce());
    expect(showSnackbar).toHaveBeenCalledWith(expect.objectContaining({ kind: 'success' }));
    expect(close).toHaveBeenCalled();
  });

  it('keeps the form open after a failed save and allows retrying without losing values', async () => {
    const user = userEvent.setup();
    let rejectSave: (reason: Error) => void = () => {};
    vi.mocked(saveLocation).mockReturnValueOnce(
      new Promise((_resolve, reject) => {
        rejectSave = reject;
      }),
    );
    const close = vi.fn();
    const mutate = vi.fn();
    render(<NewLocationModal close={close} mutate={mutate} />);
    const name = screen.getByRole('textbox', { name: 'Location name' });
    const save = screen.getByRole('button', { name: 'Save' });
    await user.type(name, 'Dispensary');
    await user.click(save);

    expect(save).toBeDisabled();
    expect(close).not.toHaveBeenCalled();
    expect(mutate).not.toHaveBeenCalled();
    await user.click(save);
    expect(saveLocation).toHaveBeenCalledOnce();

    await act(async () => rejectSave(new Error('Unable to save location')));
    expect(showSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({ kind: 'error', subtitle: 'Unable to save location' }),
    );
    expect(close).not.toHaveBeenCalled();
    expect(mutate).not.toHaveBeenCalled();
    expect(name).toHaveValue('Dispensary');
    expect(save).toBeEnabled();

    vi.mocked(saveLocation).mockResolvedValueOnce({ data: { name: 'Dispensary' } } as Awaited<
      ReturnType<typeof saveLocation>
    >);
    await user.click(save);
    await waitFor(() => expect(close).toHaveBeenCalledOnce());
    expect(saveLocation).toHaveBeenLastCalledWith({ locationPayload: { name: 'Dispensary', tags: [] } });
    expect(mutate).toHaveBeenCalledOnce();
  });

  it('cancels without submitting', async () => {
    const user = userEvent.setup();
    const close = vi.fn();
    render(<NewLocationModal close={close} mutate={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: /cancel/i }));
    expect(close).toHaveBeenCalledOnce();
    expect(saveLocation).not.toHaveBeenCalled();
  });
});
