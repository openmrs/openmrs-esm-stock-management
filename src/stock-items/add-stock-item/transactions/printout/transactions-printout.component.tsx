import React, { useMemo } from 'react'
import { DataTable, TableContainer, Table, TableHead, TableRow, TableHeader, TableBody, TableCell } from "@carbon/react"
import { useStockItem } from '../../../stock-items.resource';

type Props = {
    title: string;
    columns: any;
    data: any;
}

const TransactionsPrintout: React.FC<Props> = ({ columns, data, title }) => {

  
    return (
      <div>
        <p>{title}</p>
        <DataTable
            data-floating-menu-container
            rows={data}
            headers={columns}
            useZebraStyles
        >
            {({ rows, headers, getHeaderProps, getTableProps, onInputChange }) => (
                <div>
                    <TableContainer >

                        <Table {...getTableProps()}>
                            <TableHead>
                                <TableRow>
                                    {headers.map((header) => (
                                        <TableHeader {...getHeaderProps({ header })}>{header.header}</TableHeader>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rows.map((row) => (
                                    <TableRow key={row.id}>
                                        {row.cells.map((cell) => (
                                            <TableCell key={cell.id}>{cell.value}</TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                    </TableContainer>
                </div>
            )}
        </DataTable>
      </div>
    )
}

export default TransactionsPrintout