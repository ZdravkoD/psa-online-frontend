import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Collapse, IconButton } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import AlternativeNames from '../AlternativeNames/AlternativeNames';
import { BoughtProductsTableProps } from '../../types/product';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import {
    getDistributorNames,
    getProductInfoByDistributor,
} from '../../utils/report';


const BoughtProductsTable: React.FC<BoughtProductsTableProps> = (boughtProductsTableProps) => {
    const [openProduct, setOpenProduct] = useState<string | null>(null);
    const [tableExpanded, setTableExpanded] = useState<boolean>(true);
    const distributors = getDistributorNames(
        boughtProductsTableProps.distributors,
        boughtProductsTableProps.products
    );
    
    return (
        <TableContainer component={Paper} elevation={4} sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h6" component="div" sx={{ padding: '16px', backgroundColor: '#f5f5f5', color: '#3f51b5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Списък със закупени продукти ({boughtProductsTableProps.products.length})</span>
                <IconButton onClick={() => setTableExpanded(!tableExpanded)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                    {tableExpanded ? <KeyboardArrowUpIcon/> : <KeyboardArrowDownIcon/>}
                </IconButton>
            </Typography>
            <Collapse in={tableExpanded}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#e0e0e0' }}>
                            <TableCell>Продукт</TableCell>
                            {distributors.map((distributor) => (
                                <React.Fragment key={distributor}>
                                    <TableCell align="center">{distributor} продукт</TableCell>
                                    <TableCell align="center">{distributor} цена</TableCell>
                                </React.Fragment>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {boughtProductsTableProps.products.map((product) => {
                            return (<TableRow key={product.original_product_name} hover>
                                <TableCell component="th" scope="row" sx={{ minWidth: 300 }}>
                                    {product.original_product_name}
                                </TableCell>
                                {distributors.map((distributor) => {
                                    const productInfo = getProductInfoByDistributor(
                                        product,
                                        distributor
                                    ) || {
                                        name: 'Не е намерен',
                                        price: -1,
                                        alternative_names: [],
                                        is_on_promotion: false,
                                    };
                                    const isHighlighted = product.bought_from_distributor === distributor;
                                    const hasAlternativeNames = productInfo.name === '' && productInfo.alternative_names.length > 0;
                                    const backgroundColor = isHighlighted ? '#ccffbc' : (hasAlternativeNames ? '#00ffff' : 'inherit');

                                    return (
                                        <React.Fragment key={`${product.original_product_name}-${distributor}`}>
                                            <TableCell align="right" sx={{ backgroundColor }}>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    {productInfo?.name || 'N/A'} {productInfo?.name && productInfo.is_on_promotion ? <StarIcon style={{ color: '#ff0000' }}/> : ''}
                                                    {hasAlternativeNames && (
                                                        <>
                                                            <div>
                                                                <button onClick={() => setOpenProduct(product.original_product_name)} style={{ marginLeft: '8px', background: 'none', border: 'none', cursor: 'pointer' }}>
                                                                    <Typography variant="body2" color="error">
                                                                        <AddShoppingCartIcon />
                                                                    </Typography>
                                                                </button>
                                                                {openProduct === product.original_product_name && (
                                                                    <AlternativeNames 
                                                                        open={openProduct === product.original_product_name} 
                                                                        onClose={() => setOpenProduct(null)} 
                                                                        productName={product.original_product_name}
                                                                        alternativeNames={productInfo.alternative_names || []}
                                                                    />
                                                                )}
                                                            </div>
                                                        </>
                                                    )}                                    
                                                </div>
                                            </TableCell>
                                            <TableCell align="right" sx={{ minWidth: 50, backgroundColor }}>
                                                {productInfo.price > 0 ? `${productInfo.price} €` : 'N/A'}
                                            </TableCell>
                                        </React.Fragment>
                                    );
                                })}
                            </TableRow>)
                        })}
                    </TableBody>
                </Table>
            </Collapse>
        </TableContainer>
    );
};

export default BoughtProductsTable;
