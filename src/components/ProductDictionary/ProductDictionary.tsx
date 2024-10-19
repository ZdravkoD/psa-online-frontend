import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    TextField,
    Button,
    Pagination,
    Paper,
    Typography,
    List,
    ListItem,
    IconButton,
    ListItemText,
    CircularProgress,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import config from '../../config/config';

const API_BASE_URL = config.apiBaseUrl;

interface Product {
    id: string;
    original_product_name: string;
    generated_product_variations: string[];
    custom_product_name_variations: string[];
}

const ProductDictionary: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [pendingSearchTerm, setPendingSearchTerm] = useState<string>('');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize] = useState<number>(10);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [httpError, setHttpError] = useState<string | null>(null);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${API_BASE_URL}/product-names`, {
                    params: {
                        filter: JSON.stringify({ original_product_name: searchTerm }),
                        skip: (currentPage - 1) * pageSize,
                        limit: pageSize,
                    },
                });
                setProducts(response.data.items);
                setTotalCount(response.data.total_count);
                setHttpError(null);
            } catch (error) {
                console.error('Error fetching products:', error);
                setHttpError('Грешка при заявка на продуктите. Моля опитайте отново.');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [searchTerm, currentPage, pageSize]);

    const searchTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setPendingSearchTerm(value);
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            setSearchTerm(value);
            setCurrentPage(1);
        }, 500);
    };

    const handleCustomVariationsChange = async (id: string, variations: string[]) => {
        try {
            const modifiedProduct = await axios.patch(`${API_BASE_URL}/product-names`, {
                id,
                custom_product_name_variations: variations,
            });
            setProducts(products.map((product) => (product.id === id ? modifiedProduct.data : product)));
            setHttpError(null)
        } catch (error) {
            console.error('Error updating custom variations:', error);
            setHttpError('Грешка при актуализиране на персонализираните вариации');
        }
    };

    return (
        <div>
            {httpError && (
                <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
                    <Typography color="error" variant="body1" style={{ backgroundColor: 'white', padding: '10px', borderRadius: '5px', boxShadow: '0px 0px 10px rgba(0,0,0,0.1)' }}>
                        {httpError}
                        <Button onClick={() => setHttpError(null)}>X</Button>
                    </Typography>
                </div>
            )}
            <TextField
                label="Търси по оригинално име на продукта"
                value={pendingSearchTerm}
                onChange={handleSearch}
                variant="outlined"
                fullWidth
                margin="normal"
            />
            <TableContainer component={Paper} elevation={4} sx={{ mt: 4, mb: 4 }}>
                <Typography variant="h6" component="div" sx={{ padding: '16px', backgroundColor: '#f5f5f5', color: '#3f51b5', display: 'flex', alignItems: 'center' }}>
                    Имена на продукти {loading && (
                        <div style={{ display: 'flex', alignItems: 'center', marginLeft: '10px' }}>
                            <CircularProgress size={24} />
                        </div>
                    )}
                </Typography>

                <Table>
                    <TableHead>
                    <TableRow sx={{ backgroundColor: '#e0e0e0' }}>
                        <TableCell><strong>Оригинално име на продукта</strong></TableCell>
                        <TableCell><strong>Генерирани вариации на продукта</strong></TableCell>
                        <TableCell><strong>Персонализирани вариации на името на продукта</strong></TableCell>
                    </TableRow>
                    </TableHead>
                    <TableBody>
                    {products.map((product) => (
                        <TableRow key={product.id} hover>
                        <TableCell>{product.original_product_name}</TableCell>
                        <TableCell>
                            <List>
                                {product.generated_product_variations.map((variation, index) => (
                                    <ListItem key={index}>
                                        <ListItemText primary={variation} />
                                    </ListItem>
                                ))}
                            </List>
                        </TableCell>
                        <TableCell>
                            <List>
                                {product.custom_product_name_variations.map((variation, index) => (
                                    <ListItem key={index} secondaryAction={
                                    <IconButton edge="end" aria-label="delete" onClick={() => {
                                        const newVariations = product.custom_product_name_variations.filter((_, i) => i !== index);
                                        handleCustomVariationsChange(product.id, newVariations);
                                    }}>
                                        <DeleteIcon />
                                    </IconButton>
                                    }>
                                    <ListItemText primary={variation} />
                                    </ListItem>
                                ))}
                                <ListItem>
                                    <TextField
                                    placeholder="Add new variation"
                                    onKeyDown={(e) => {
                                        console.log("textField onKeyDown value: ", (e.target as HTMLInputElement).value);
                                        console.log("textField onKeyDown key: ", e.key);
                                        const inputValue = (e.target as HTMLInputElement)?.value?.trim();
                                        if (e.key === 'Enter' && inputValue !== '') {
                                        const newVariations = [...product.custom_product_name_variations, inputValue];
                                        handleCustomVariationsChange(product.id, newVariations);
                                        (e.target as HTMLInputElement).value = '';
                                        }
                                    }}
                                    variant="standard"
                                    fullWidth
                                    />
                                </ListItem>
                            </List>
                        </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <Pagination
                count={Math.ceil(totalCount / pageSize)}
                page={currentPage}
                onChange={(event, page) => setCurrentPage(page)}
                style={{ marginTop: 20 }}
            />
        </div>
    );
};

export default ProductDictionary;