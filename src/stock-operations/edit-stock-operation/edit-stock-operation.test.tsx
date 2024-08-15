import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import EditStockOperationActionMenu from './edit-stock-operation-action-menu.component';
import { launchAddOrEditDialog } from "../stock-operation.utils";
import { mockStockOperationDTO } from '../../core/api/types/stockOperation/mocks/StockOperationDTO.mock';
import { getStockOperation } from '../stock-operations.resource';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: key => key }),
}));

jest.mock('../stock-operation.utils', () => ({
  launchAddOrEditDialog: jest.fn(),
}));

jest.mock('../stock-operations.resource', () => ({
  getStockOperation: jest.fn(),
}));

describe('EditStockOperationActionMenu', () => {
  const mockOperations = [];
  
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders button with operation number from model', () => {
    render(<EditStockOperationActionMenu 
      model={mockStockOperationDTO} 
      operations={mockOperations} 
    />);
    
    expect(screen.getByText(mockStockOperationDTO.operationNumber)).toBeInTheDocument();
  });

  test('renders button with provided operationNumber over model', () => {
    const providedOperationNumber = 'OP001';
    render(<EditStockOperationActionMenu 
      operationNumber={providedOperationNumber}
      model={mockStockOperationDTO}
      operations={mockOperations} 
    />);
    
    expect(screen.getByText(providedOperationNumber)).toBeInTheDocument();
  });

  test('calls launchAddOrEditDialog when button is clicked with model', () => {
    render(<EditStockOperationActionMenu 
      model={mockStockOperationDTO} 
      operations={mockOperations} 
    />);
    
    fireEvent.click(screen.getByText(mockStockOperationDTO.operationNumber));
    
    expect(launchAddOrEditDialog).toHaveBeenCalledWith(
      expect.any(Function),
      mockStockOperationDTO,
      true,
      expect.any(Object),
      mockOperations
    );
  });

});