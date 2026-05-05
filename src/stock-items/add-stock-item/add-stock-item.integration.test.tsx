import React from 'react';
import { render, screen } from '@testing-library/react';
import { type StockItemDTO } from '../../core/api/types/stockItem/StockItem';
import AddEditStockItem from './add-stock-item.component';

// Mock the API-hitting child components so the integration test can focus on
// the form-staleness behaviour without bringing in their dependencies.
jest.mock('./drug-selector/drug-selector.component', () => () => <div data-testid="drug-selector" />);
jest.mock('./concepts-selector/concepts-selector.component', () => () => <div data-testid="concepts-selector" />);
jest.mock('./stock-item-category-selector/stock-item-category-selector.component', () => () => (
  <div data-testid="stock-item-category-selector" />
));
jest.mock('./dispensing-unit-selector/dispensing-unit-selector.component', () => () => (
  <div data-testid="dispensing-unit-selector" />
));
jest.mock('./preferred-vendor-selector/preferred-vendor-selector.component', () => () => (
  <div data-testid="preferred-vendor-selector" />
));
jest.mock('./stock-item-units-edit/stock-item-units-edit.component', () => () => (
  <div data-testid="stock-item-units-edit" />
));

// Other tabs are only mounted if the user navigates to them; the default tab
// is Stock Item Details, which is what this test exercises. Mock them to keep
// the test surface small.
jest.mock('./packaging-units/packaging-units.component', () => () => <div data-testid="packaging-units" />);
jest.mock('./transactions/transactions.component', () => () => <div data-testid="transactions" />);
jest.mock('./batch-information/batch-information.component', () => () => <div data-testid="batch-information" />);
jest.mock('./quantities/quantities.component', () => () => <div data-testid="quantities" />);
jest.mock('./stock-item-rules/stock-item-rules.component', () => () => <div data-testid="stock-item-rules" />);
jest.mock('./stock-item-references/stock-item-references.component', () => () => (
  <div data-testid="stock-item-references" />
));

const baseItem: Partial<StockItemDTO> = {
  isDrug: false,
  hasExpiration: false,
  commonName: '',
  acronym: '',
  conceptName: '',
  expiryNotice: 0,
  permission: { canView: true, canEdit: true } as StockItemDTO['permission'],
};

describe('AddEditStockItem (integration)', () => {
  it('shows the newly selected stock item in the Stock Item Details form fields when stockItem changes', () => {
    const itemA: StockItemDTO = {
      ...(baseItem as StockItemDTO),
      uuid: 'item-a',
      commonName: 'Aspirin',
      acronym: 'ASP',
    };
    const itemB: StockItemDTO = {
      ...(baseItem as StockItemDTO),
      uuid: 'item-b',
      commonName: 'Paracetamol',
      acronym: 'PCM',
    };

    const { rerender } = render(<AddEditStockItem stockItem={itemA} />);

    expect(screen.getByDisplayValue('Aspirin')).toBeInTheDocument();
    expect(screen.getByDisplayValue('ASP')).toBeInTheDocument();

    rerender(<AddEditStockItem stockItem={itemB} />);

    expect(screen.getByDisplayValue('Paracetamol')).toBeInTheDocument();
    expect(screen.getByDisplayValue('PCM')).toBeInTheDocument();
    expect(screen.queryByDisplayValue('Aspirin')).not.toBeInTheDocument();
    expect(screen.queryByDisplayValue('ASP')).not.toBeInTheDocument();
  });
});
