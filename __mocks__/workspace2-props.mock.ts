import { vi } from 'vitest';
import { type Workspace2DefinitionProps } from '@openmrs/esm-framework';

export function mockWorkspace2Props<T extends object>(
  workspaceProps: T,
  overrides: Partial<Workspace2DefinitionProps<T>> = {},
): Workspace2DefinitionProps<T> {
  return {
    workspaceProps,
    windowProps: null,
    groupProps: null,
    closeWorkspace: vi.fn(),
    launchChildWorkspace: vi.fn(),
    workspaceName: '',
    windowName: '',
    isRootWorkspace: true,
    showActionMenu: false,
    ...overrides,
  };
}
