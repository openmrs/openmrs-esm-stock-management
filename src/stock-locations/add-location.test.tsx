import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
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

  it('cancels without submitting', async () => {
    const user = userEvent.setup();
    const close = vi.fn();
    render(<NewLocationModal close={close} mutate={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: /cancel/i }));
    expect(close).toHaveBeenCalledOnce();
    expect(saveLocation).not.toHaveBeenCalled();
  });
});
