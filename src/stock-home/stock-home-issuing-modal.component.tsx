import React from 'react';
import { Modal, Table, TableHead, TableRow, TableHeader, TableBody, TableCell, TableContainer } from '@carbon/react';

const IssuingStockModal = ({ open, onClose, issuingStock }) => {
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
      modalHeading="Issued Stock"
      primaryButtonText="Close"
      onSecondarySubmit={onClose}
      size="lg"
    >
      <div>
        {issuingStock && issuingStock.length > 0 ? (
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
                {issuingStock.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item?.status || 'N/A'}</TableCell>
                    <TableCell>{item?.sourceName || 'N/A'}</TableCell>
                    <TableCell>{item?.destinationName || 'N/A'}</TableCell>
                    <TableCell>{item?.stockItemName || 'N/A'}</TableCell>
                    <TableCell>{item?.stockItemPackagingUOMName || 'N/A'}</TableCell>
                    <TableCell>{item?.quantity || 'N/A'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <p>No issued stock data available.</p>
        )}
      </div>
    </Modal>
  );
};

export default IssuingStockModal;
