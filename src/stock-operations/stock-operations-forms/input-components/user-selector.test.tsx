import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import useSearchUser from '../hooks/useSearchUser';
import { useUser } from '../../../stock-lookups/stock-lookups.resource';

jest.mock('../hooks/useSearchUser');
jest.mock('../../../stock-lookups/stock-lookups.resource');
jest.mock('react-hook-form');

const mockeuseSearchUser = useSearchUser as jest.Mock;
const mockeuseUser = useUser as jest.Mock;

describe('Userselector', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
});
