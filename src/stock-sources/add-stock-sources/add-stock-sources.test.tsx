import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';
import StockSourcesAddOrUpdate from './add-stock-sources.workspace';
import { createOrUpdateStockSource } from '../stock-sources.resource';
import { useConfig } from '@openmrs/esm-framework';

import { type StockSource } from '../../core/api/types/stockOperation/StockSource';

jest.mock('../stock-sources.resource');
jest.mock('@openmrs/esm-framework', () => ({
  showSnackbar: jest.fn(),
  useConfig: jest.fn(),
  getCoreTranslation: jest.fn((key, defaultValue) => {
    const translations: Record<string, string> = {
      cancel: 'Cancel',
      save: 'Save',
    };
    return translations[key] ?? defaultValue;
  }),
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
    (useConfig as jest.Mock).mockReturnValue({ stockSourceTypeUUID: 'mock-uuid' });
  });

  it('renders correctly without model prop', () => {
    render(
      <StockSourcesAddOrUpdate
        closeWorkspace={jest.fn()}
        setTitle={jest.fn()}
        closeWorkspaceWithSavedChanges={jest.fn()}
        promptBeforeClosing={jest.fn()}
      />,
    );
    expect(screen.getByLabelText('Full Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Acronym/Code')).toBeInTheDocument();
    expect(screen.getByLabelText('Source Type')).toBeInTheDocument();
  });

  it('renders correctly with model prop', () => {
    const model: StockSource = {
      uuid: '123',
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
    render(
      <StockSourcesAddOrUpdate
        model={model}
        closeWorkspace={jest.fn()}
        setTitle={jest.fn()}
        closeWorkspaceWithSavedChanges={jest.fn()}
        promptBeforeClosing={jest.fn()}
      />,
    );
    expect(screen.getByLabelText('Full Name')).toHaveValue('Test Source');
    expect(screen.getByLabelText('Acronym/Code')).toHaveValue('TS');
    expect(screen.getByLabelText('Source Type')).toHaveValue('type1');
  });

  it('updates form fields correctly on user input', async () => {
    const user = userEvent.setup();
    render(
      <StockSourcesAddOrUpdate
        closeWorkspace={jest.fn()}
        setTitle={jest.fn()}
        closeWorkspaceWithSavedChanges={jest.fn()}
        promptBeforeClosing={jest.fn()}
      />,
    );

    await user.type(screen.getByLabelText('Full Name'), 'New Source');
    await user.type(screen.getByLabelText('Acronym/Code'), 'NS');

    expect(screen.getByLabelText('Full Name')).toHaveValue('New Source');
    expect(screen.getByLabelText('Acronym/Code')).toHaveValue('NS');
  });

  it('calls createOrUpdateStockSource with correct data on form submission', async () => {
    const user = userEvent.setup();
    (createOrUpdateStockSource as jest.Mock).mockResolvedValue({});

    render(
      <StockSourcesAddOrUpdate
        closeWorkspace={jest.fn()}
        setTitle={jest.fn()}
        closeWorkspaceWithSavedChanges={jest.fn()}
        promptBeforeClosing={jest.fn()}
      />,
    );

    await user.type(screen.getByLabelText('Full Name'), 'New Source');
    await user.type(screen.getByLabelText('Acronym/Code'), 'NS');
    await user.selectOptions(screen.getByLabelText('Source Type'), 'type2');
    await user.click(screen.getByText('Save'));
  });

  it('shows success message and closes overlay on successful submission', async () => {
    const user = userEvent.setup();
    (createOrUpdateStockSource as jest.Mock).mockResolvedValue({});

    render(
      <StockSourcesAddOrUpdate
        closeWorkspace={jest.fn()}
        setTitle={jest.fn()}
        closeWorkspaceWithSavedChanges={jest.fn()}
        promptBeforeClosing={jest.fn()}
      />,
    );

    await user.click(screen.getByText('Save'));
  });

  it('shows error message on failed submission', async () => {
    const user = userEvent.setup();
    (createOrUpdateStockSource as jest.Mock).mockRejectedValue(new Error('API Error'));

    render(
      <StockSourcesAddOrUpdate
        closeWorkspace={jest.fn()}
        setTitle={jest.fn()}
        closeWorkspaceWithSavedChanges={jest.fn()}
        promptBeforeClosing={jest.fn()}
      />,
    );

    await user.click(screen.getByText('Save'));
  });

  it('closes overlay when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <StockSourcesAddOrUpdate
        closeWorkspace={jest.fn()}
        setTitle={jest.fn()}
        closeWorkspaceWithSavedChanges={jest.fn()}
        promptBeforeClosing={jest.fn()}
      />,
    );

    await user.click(screen.getByText('Cancel'));
  });
});
