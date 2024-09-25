import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import StockSourcesAddOrUpdate from './add-stock-sources.component';
import { createOrUpdateStockSource } from '../stock-sources.resource';
import { showSnackbar, useConfig } from '@openmrs/esm-framework';
import { closeOverlay } from '../../core/components/overlay/hook';
import { StockSource } from '../../core/api/types/stockOperation/StockSource';

jest.mock('../stock-sources.resource');
jest.mock('@openmrs/esm-framework', () => ({
  showSnackbar: jest.fn(),
  useConfig: jest.fn(),
}));
jest.mock('../../core/components/overlay/hook', () => ({
  closeOverlay: jest.fn(),
}));
jest.mock('../../stock-lookups/stock-lookups.resource', () => ({
  useConcept: jest.fn(() => ({
    items: {
      answers: [
        { uuid: 'type1', display: 'Type 1' },
        { uuid: 'type2', display: 'Type 2' },
      ],
    },
  })),
}));

describe('StockSourcesAddOrUpdate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useConfig as jest.Mock).mockReturnValue({ stockSourceTypeUUID: 'mock-uuid' });
  });

  it('renders correctly without model prop', () => {
    render(<StockSourcesAddOrUpdate />);
    expect(screen.getByLabelText('Full Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Acronym/Code')).toBeInTheDocument();
    expect(screen.getByLabelText('Source Type')).toBeInTheDocument();
  });

  it('renders correctly with model prop', () => {
    const model: StockSource = {
      uuid: '123', // Add this
      name: 'Test Source',
      acronym: 'TS',
      sourceType: {
        uuid: 'type1',
        display: 'Type 1',
        conceptId: 0,
        set: false,
        version: '',
        names: [],
        name: undefined,
        numeric: false,
        complex: false,
        shortNames: [],
        indexTerms: [],
        synonyms: [],
        setMembers: [],
        possibleValues: [],
        preferredName: undefined,
        shortName: undefined,
        fullySpecifiedName: undefined,
        answers: [],
        creator: undefined,
        dateCreated: undefined,
        changedBy: undefined,
        dateChanged: undefined,
        retired: false,
        dateRetired: undefined,
        retiredBy: undefined,
        retireReason: '',
      },
      // Add these properties from BaseOpenmrsData
      creator: {
        uuid: 'creator-uuid',
        display: 'Creator Name',
        givenName: '',
        familyName: '',
        firstName: '',
        lastName: '',
        privileges: [],
      },
      dateCreated: new Date(),
      changedBy: null,
      dateChanged: null,
      voided: false,
      voidedBy: null,
      dateVoided: null,
      voidReason: null,
    };
    render(<StockSourcesAddOrUpdate model={model} />);
    expect(screen.getByLabelText('Full Name')).toHaveValue('Test Source');
    expect(screen.getByLabelText('Acronym/Code')).toHaveValue('TS');
    expect(screen.getByLabelText('Source Type')).toHaveValue('type1');
  });

  it('updates form fields correctly on user input', () => {
    render(<StockSourcesAddOrUpdate />);

    fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'New Source' } });
    fireEvent.change(screen.getByLabelText('Acronym/Code'), { target: { value: 'NS' } });
    fireEvent.change(screen.getByLabelText('Source Type'), { target: { value: 'type2' } });

    expect(screen.getByLabelText('Full Name')).toHaveValue('New Source');
    expect(screen.getByLabelText('Acronym/Code')).toHaveValue('NS');
    expect(screen.getByLabelText('Source Type')).toHaveValue('type2');
  });

  it('calls createOrUpdateStockSource with correct data on form submission', async () => {
    (createOrUpdateStockSource as jest.Mock).mockResolvedValue({});

    render(<StockSourcesAddOrUpdate />);

    fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'New Source' } });
    fireEvent.change(screen.getByLabelText('Acronym/Code'), { target: { value: 'NS' } });
    fireEvent.change(screen.getByLabelText('Source Type'), { target: { value: 'type2' } });

    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(createOrUpdateStockSource).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'New Source',
          acronym: 'NS',
          sourceType: { uuid: 'type2', display: 'Type 2' },
        }),
      );
    });
  });

  it('shows success message and closes overlay on successful submission', async () => {
    (createOrUpdateStockSource as jest.Mock).mockResolvedValue({});

    render(<StockSourcesAddOrUpdate />);

    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(showSnackbar).toHaveBeenCalledWith(
        expect.objectContaining({
          kind: 'success',
          title: 'Add Source',
        }),
      );
      expect(closeOverlay).toHaveBeenCalled();
    });
  });

  it('shows error message on failed submission', async () => {
    (createOrUpdateStockSource as jest.Mock).mockRejectedValue(new Error('API Error'));

    render(<StockSourcesAddOrUpdate />);

    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(showSnackbar).toHaveBeenCalledWith(
        expect.objectContaining({
          kind: 'error',
          title: 'Error adding a source',
        }),
      );
    });
  });

  it('closes overlay when cancel button is clicked', () => {
    render(<StockSourcesAddOrUpdate />);

    fireEvent.click(screen.getByText('Cancel'));

    expect(closeOverlay).toHaveBeenCalled();
  });
});
