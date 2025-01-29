import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import useSearchUser from '../hooks/useSearchUser';
import { useUser } from '../../../stock-lookups/stock-lookups.resource';
import { useFormContext } from 'react-hook-form';
import { otherUser } from '../../../core/utils/utils';
import UsersSelector from './users-selector.component';

jest.mock('../hooks/useSearchUser');
jest.mock('../../../stock-lookups/stock-lookups.resource');
jest.mock('react-hook-form');
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const mockUseSearchUser = useSearchUser as jest.Mock;
const mockUseUser = useUser as jest.Mock;
const mockUseFormContext = useFormContext as jest.Mock;

describe('UsersSelector', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseFormContext.mockReturnValue({
      control: {},
      watch: jest.fn().mockImplementation((field) => {
        if (field === 'responsiblePersonUuid') return 'responsibleperson.uuid';
        if (field === 'responsiblePersonOther') return 'responsiblepersonother.uuid';
        return '';
      }),
      resetField: jest.fn(),
    });
  });

  it('renders loading state', async () => {
    mockUseSearchUser.mockReturnValue({ isLoading: true, userList: [], setSearchString: jest.fn() });
    mockUseUser.mockReturnValue({ isLoading: true, data: null, error: null });

    render(<UsersSelector />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders error state', () => {
    const errorMessage = 'Error message';
    mockUseSearchUser.mockReturnValue({ isLoading: false, userList: [], setSearchString: jest.fn() });
    mockUseUser.mockReturnValue({ isLoading: false, data: null, error: new Error(errorMessage) });
    render(<UsersSelector />);
    expect(screen.getByText('responsiblePersonError')).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });
});
