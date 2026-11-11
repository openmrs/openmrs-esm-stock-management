import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { type Session, useSession, userHasAccess } from '@openmrs/esm-framework';
import { type UserRoleScope } from '../core/api/types/identity/UserRoleScope';
import useStockUserRoleScopesPage from './stock-user-role-scopes-items-table.resource';
import StockUserRoleScopesItems from './stock-user-role-scopes-items-table.component';

const mockUseStockUserRoleScopesPage = vi.mocked(useStockUserRoleScopesPage);
const mockUseSession = vi.mocked(useSession);
const mockUserHasAccess = vi.mocked(userHasAccess);

vi.mock('./stock-user-role-scopes-items-table.resource', () => ({
  default: vi.fn(),
}));

vi.mock('../utils', () => ({
  useHandleMutate: () => vi.fn(),
}));

vi.mock('./edit-stock-user-scope/edit-stock-user-scope-action-menu.component', () => ({
  default: () => <button>Edit user role scope</button>,
}));

vi.mock('./delete-stock-user-scope/delete-stock-user-scope.component', () => ({
  default: () => <button>Delete user role scope</button>,
}));

const scope = (uuid: string, userUuid: string, familyName: string, givenName: string) =>
  ({
    uuid,
    userUuid,
    userFamilyName: familyName,
    userGivenName: givenName,
    role: 'Inventory Clerk',
    locations: [],
    operationTypes: [],
    permanent: true,
    enabled: true,
  } as UserRoleScope);

const buildPageResult = (overrides: Partial<ReturnType<typeof useStockUserRoleScopesPage>> = {}) =>
  ({
    items: [scope('scope-1', 'other-user', 'Doe', 'Jane')],
    totalItems: 1,
    currentPage: 1,
    currentPageSize: 10,
    pageSizes: [10, 20, 50],
    goTo: vi.fn(),
    setPageSize: vi.fn(),
    paginatedItems: [],
    isLoading: false,
    error: undefined,
    ...overrides,
  } as ReturnType<typeof useStockUserRoleScopesPage>);

describe('StockUserRoleScopesItems', () => {
  beforeEach(() => {
    mockUseSession.mockReturnValue({ user: { uuid: 'current-user' } } as Session);
    mockUserHasAccess.mockReturnValue(true);
    mockUseStockUserRoleScopesPage.mockReturnValue(
      buildPageResult({
        items: [scope('scope-1', 'current-user', 'Admin', 'Super'), scope('scope-2', 'other-user', 'Doe', 'Jane')],
        totalItems: 2,
        pageSizes: [10, 20],
      }),
    );
  });

  it('shows user names as plain text, without links to routes the app does not serve', () => {
    render(<StockUserRoleScopesItems />);

    expect(screen.getByText('Admin Super')).toBeInTheDocument();
    expect(screen.getByText('Doe Jane')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Doe Jane' })).not.toBeInTheDocument();
  });

  it('renders an error state instead of the empty list when loading fails', () => {
    mockUserHasAccess.mockReturnValue(false);
    mockUseStockUserRoleScopesPage.mockReturnValue(
      buildPageResult({
        items: [],
        paginatedItems: [],
        totalItems: 0,
        error: new Error('Failed to load user role scopes'),
      }),
    );

    render(<StockUserRoleScopesItems />);

    expect(screen.getByText(/error state/i)).toBeInTheDocument();
    expect(screen.queryByText(/no stock user role scopes to display/i)).not.toBeInTheDocument();
  });

  it('shows the add button when the user has the mutate privilege', () => {
    mockUserHasAccess.mockReturnValue(true);
    mockUseStockUserRoleScopesPage.mockReturnValue(buildPageResult());

    render(<StockUserRoleScopesItems />);

    expect(screen.getByRole('button', { name: /add new user role scope/i })).toBeInTheDocument();
  });

  it('hides the add button when the user lacks the mutate privilege', () => {
    mockUserHasAccess.mockReturnValue(false);
    mockUseStockUserRoleScopesPage.mockReturnValue(buildPageResult());

    render(<StockUserRoleScopesItems />);

    expect(screen.queryByRole('button', { name: /add new user role scope/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /edit user role scope/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /delete user role scope/i })).not.toBeInTheDocument();
  });
});
