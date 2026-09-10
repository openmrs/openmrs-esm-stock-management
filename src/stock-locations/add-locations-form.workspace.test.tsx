import React from 'react';
import { render } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import { showModal, type DefaultWorkspaceProps } from '@openmrs/esm-framework';
import { useStockTagLocations } from '../stock-lookups/stock-lookups.resource';
import Workspace from './add-locations-form.workspace';

vi.mock('../stock-lookups/stock-lookups.resource', () => ({ useStockTagLocations: vi.fn() }));

const mutate = vi.fn();

beforeEach(() => {
  vi.mocked(useStockTagLocations).mockReturnValue({ stockLocations: [], isLoading: false, error: undefined, mutate });
  vi.mocked(showModal).mockImplementation((_name, _props, onClose) => () => onClose?.());
});

it('does not close the workspace during StrictMode setup or external unmount', () => {
  const closeWorkspace = vi.fn();
  const props: DefaultWorkspaceProps = {
    closeWorkspace,
    promptBeforeClosing: vi.fn(),
    closeWorkspaceWithSavedChanges: vi.fn(),
    setTitle: vi.fn(),
  };
  const { unmount } = render(
    <React.StrictMode>
      <Workspace {...props} />
    </React.StrictMode>,
  );
  expect(closeWorkspace).not.toHaveBeenCalled();
  unmount();
  expect(closeWorkspace).not.toHaveBeenCalled();
});

it('closes the workspace once on modal dismissal and passes the bound refresh callback', () => {
  const closeWorkspace = vi.fn();
  const props: DefaultWorkspaceProps = {
    closeWorkspace,
    promptBeforeClosing: vi.fn(),
    closeWorkspaceWithSavedChanges: vi.fn(),
    setTitle: vi.fn(),
  };
  const { unmount } = render(<Workspace {...props} />);
  expect(showModal).toHaveBeenCalledWith('stock-create-location-modal', { mutate }, expect.any(Function));
  const onClose = vi.mocked(showModal).mock.calls[0][2];
  onClose();
  onClose();
  unmount();
  expect(closeWorkspace).toHaveBeenCalledOnce();
});
