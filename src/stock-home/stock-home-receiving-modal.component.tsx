import React from 'react';
import { Modal, Table, TableHead, TableRow, TableHeader, TableBody, TableCell, TableContainer } from '@carbon/react';

const ReceivingStockModal = ({ open, onClose, receivingStock }) => {
  const headers = [
    { key: 'status', header: 'Status' },
    { key: 'sourceName', header: 'Source' },
    { key: 'destinationName', header: 'Destination' },
    { key: 'stockItemName', header: 'Stock Item' },
    { key: 'stockItemPackagingUOMName', header: 'Unit' },
    { key: 'quantity', header: 'Quantity' },
  ];

  return (
    <Modal
      open={open}
      onRequestClose={onClose}
      modalHeading="Received Stock"
      primaryButtonText="Close"
      onSecondarySubmit={onClose}
      size="lg"
    >
      <div>
        {receivingStock && receivingStock.length > 0 ? (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  {headers.map((header) => (
                    <TableHeader key={header.key}>{header.header}</TableHeader>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {receivingStock.map((item, index) =>
                  item?.stockOperationItems.map((stock, stockIndex) => (
                    <TableRow key={`${index}-${stockIndex}`}>
                      <TableCell>{item?.status || 'N/A'}</TableCell>
                      <TableCell>{item?.sourceName || 'N/A'}</TableCell>
                      <TableCell>{item?.destinationName || 'N/A'}</TableCell>
                      <TableCell>{stock?.stockItemName || 'N/A'}</TableCell>
                      <TableCell>{stock?.stockItemPackagingUOMName || 'N/A'}</TableCell>
                      <TableCell>{stock?.quantity || 'N/A'}</TableCell>
                    </TableRow>
                  )),
                )}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <p>No received stock data available.</p>
        )}
      </div>
    </Modal>
  );
};

export default ReceivingStockModal;
