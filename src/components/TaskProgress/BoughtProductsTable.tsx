import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from '@mui/material';


interface AllPharmacyProductInfos {
    distributor: string;
    name: string;
    price: number;
}

interface BoughtProduct {
    original_product_name: string;
    bought_from_distributor: string;
    all_pharmacy_product_infos: AllPharmacyProductInfos[];
}

interface BoughtProductsTableProps {
    products: BoughtProduct[];
}

const BoughtProductsTable: React.FC<BoughtProductsTableProps> = (boughtProductsTableProps) => {
    return (
        <TableContainer component={Paper} elevation={4} sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h6" component="div" sx={{ padding: '16px', backgroundColor: '#f5f5f5', color: '#3f51b5' }}>
                Списък със закупени продукти
            </Typography>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                    <TableRow sx={{ backgroundColor: '#e0e0e0' }}>
                        <TableCell>Продукт</TableCell>
                        <TableCell align="right">Sting продукт</TableCell>
                        <TableCell align="right">Sting цена</TableCell>
                        <TableCell align="right">Phoenix продукт</TableCell>
                        <TableCell align="right">Phoenix цена</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {boughtProductsTableProps.products.map((product) => {
                        const sting_info = product.all_pharmacy_product_infos.filter(info => info.distributor === "Sting")[0] || {name: "Не е намерен", price: -1};
                        const phoenix_info = product.all_pharmacy_product_infos.filter(info => info.distributor === "Phoenix")[0] || {name: "Не е намерен", price: -1};
                        return (<TableRow key={product.original_product_name} hover>
                            <TableCell component="th" scope="row" sx={{ minWidth: 300 }}>
                                {product.original_product_name}
                            </TableCell>
                            <TableCell align="right" sx={{ backgroundColor: product.bought_from_distributor === "Sting" ? '#ccffbc' : 'inherit' }}>
                                {sting_info?.name || "N/A"}
                            </TableCell>
                            <TableCell align="right" sx={{ minWidth: 50, backgroundColor: product.bought_from_distributor === "Sting" ? '#ccffbc' : 'inherit' }}>
                                {sting_info.price > 0 ? `${sting_info.price} лв` : "N/A"}
                            </TableCell>
                            <TableCell align="right" sx={{ backgroundColor: product.bought_from_distributor === "Phoenix" ? '#ccffbc' : 'inherit' }}>
                                {phoenix_info?.name || "N/A"}
                            </TableCell>
                            <TableCell align="right" sx={{ minWidth: 50, backgroundColor: product.bought_from_distributor === "Phoenix" ? '#ccffbc' : 'inherit' }}>
                                {phoenix_info.price > 0 ? `${phoenix_info.price} лв` : "N/A"}
                            </TableCell>
                        </TableRow>)
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default BoughtProductsTable;
