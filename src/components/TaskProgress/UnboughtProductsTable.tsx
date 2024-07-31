import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from '@mui/material';

interface UnboughtProduct {
    product_name: string;
    quantity: number;
}

interface UnboughtProductsTableProps {
    products: UnboughtProduct[];
}

const UnboughtProductsTable: React.FC<UnboughtProductsTableProps> = (unboughtProductsTableProps) => {
    return (
        <TableContainer component={Paper} elevation={4} sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h6" component="div" sx={{ padding: '16px', backgroundColor: '#f5f5f5', color: '#3f51b5' }}>
                Списък с незакупени продукти
            </Typography>            
            <Table sx={{ minWidth: 450 }} aria-label="unbought products table">
                <TableHead>
                    <TableRow sx={{ backgroundColor: '#e0e0e0' }}>
                        <TableCell>Продукт</TableCell>
                        <TableCell align="right">Брой</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {unboughtProductsTableProps.products.map((product) => (
                        <TableRow key={product.product_name} hover>
                            <TableCell component="th" scope="row">
                                {product.product_name}
                            </TableCell>
                            <TableCell align="right">{product.quantity}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default UnboughtProductsTable;
