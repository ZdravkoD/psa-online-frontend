import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import AlternativeNames from '../AlternativeNames/AlternativeNames';


interface AllPharmacyProductInfos {
    distributor: string;
    name: string;
    price: number;
    is_on_promotion: boolean;
    alternative_names: string[];
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
    const [isAlternativeNamesDrawerOpen, setAlternativeNamesDrawerOpen] = useState(false);
    
    return (
        <TableContainer component={Paper} elevation={4} sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h6" component="div" sx={{ padding: '16px', backgroundColor: '#f5f5f5', color: '#3f51b5' }}>
                Списък със закупени продукти ({boughtProductsTableProps.products.length})
            </Typography>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                    <TableRow sx={{ backgroundColor: '#e0e0e0' }}>
                        <TableCell>Продукт</TableCell>
                        <TableCell align="center">Sting продукт</TableCell>
                        <TableCell align="center">Sting цена</TableCell>
                        <TableCell align="center">Phoenix продукт</TableCell>
                        <TableCell align="center">Phoenix цена</TableCell>
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
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {sting_info?.name || "N/A"} {sting_info?.name && sting_info.is_on_promotion ? <StarIcon style={{ color: '#ff0000' }}/> : ""}
                                    {sting_info?.name === "" && sting_info.alternative_names && (
                                        <>
                                            <div>
                                                <button onClick={() => setAlternativeNamesDrawerOpen(true)} style={{ marginLeft: '8px', background: 'none', border: 'none', cursor: 'pointer' }}>
                                                    <Typography variant="body2" color="error">
                                                        <AddShoppingCartIcon />
                                                    </Typography>
                                                </button>
                                                {isAlternativeNamesDrawerOpen && (
                                                    <AlternativeNames 
                                                        open={isAlternativeNamesDrawerOpen} 
                                                        onClose={() => setAlternativeNamesDrawerOpen(false)} 
                                                        productName={product.original_product_name}
                                                        alternativeNames={sting_info.alternative_names || []}
                                                    />
                                                )}
                                            </div>
                                        </>
                                    )}                                    
                                </div>
                            </TableCell>
                            <TableCell align="right" sx={{ minWidth: 50, backgroundColor: product.bought_from_distributor === "Sting" ? '#ccffbc' : 'inherit' }}>
                                {sting_info.price > 0 ? `${sting_info.price} лв` : "N/A"}
                            </TableCell>
                            <TableCell align="right" sx={{ backgroundColor: product.bought_from_distributor === "Phoenix" ? '#ccffbc' : (phoenix_info?.name === "" && phoenix_info.alternative_names ? "#00ffff" : 'inherit') }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {phoenix_info?.name || "Не е намерен"}
                                    {phoenix_info?.name === "" && phoenix_info.alternative_names && (
                                        <>
                                            <div>
                                                <button onClick={() => setAlternativeNamesDrawerOpen(true)} style={{ marginLeft: '8px', background: 'none', border: 'none', cursor: 'pointer' }}>
                                                    <Typography variant="body2" color="error">
                                                        <AddShoppingCartIcon />
                                                    </Typography>
                                                </button>
                                                {isAlternativeNamesDrawerOpen && (
                                                    <AlternativeNames 
                                                        open={isAlternativeNamesDrawerOpen} 
                                                        onClose={() => setAlternativeNamesDrawerOpen(false)} 
                                                        productName={product.original_product_name}
                                                        alternativeNames={phoenix_info.alternative_names || []}
                                                    />
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell align="right" sx={{ minWidth: 50, backgroundColor: product.bought_from_distributor === "Phoenix" ? '#ccffbc' : (phoenix_info?.name === "" && phoenix_info.alternative_names ? "#00ffff" : 'inherit') }}>
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
