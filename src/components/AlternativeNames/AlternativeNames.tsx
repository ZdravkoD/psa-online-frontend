import React, { useEffect, useState } from 'react';
import {
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Checkbox,
    CircularProgress,
    Typography,
    Backdrop,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import axios from 'axios';
import config from '../../config/config';
import { Product } from '../../types/product';

interface AlternativeNamesProps {
    open: boolean;
    productName: string;
    alternativeNames: string[];
    onClose: () => void;
}

const API_BASE_URL = config.apiBaseUrl;

const AlternativeNames: React.FC<AlternativeNamesProps> = ({ open, productName, alternativeNames, onClose }) => {
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [altNames, setAltNames] = useState<string[]>(alternativeNames);

    useEffect(() => {
        const fetchProductInfo = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/products`, {
                    params: {
                        filter: JSON.stringify({ original_product_name: productName }),
                    },
                });
                if (response.data.items.length === 0) {
                    throw new Error('Product not found');
                }
                setProduct(response.data.items[0]);
            } catch (error) {
                console.error('Error fetching product info:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProductInfo();
    }, [productName]);

    useEffect(() => {
        if (product === null) {
            return;
        }
        const filteredAltNames = alternativeNames.filter((name) => !product.custom_product_name_variations.includes(name));
        setAltNames(filteredAltNames);
    }, [product, alternativeNames]);

    const handleCheckboxChange = async (name: string) => {
        try {
            const updatedProduct = await axios.patch(`${API_BASE_URL}/product/${product?.id}`, {
                custom_product_name_variations: [...(product?.custom_product_name_variations || []), name],
            });
            setAltNames((prev) => prev.filter((n) => n !== name));
            setProduct(updatedProduct.data);
        } catch (error) {
            console.error('Error updating product names:', error);
        }
    };

    return (
        <Drawer anchor="right" open={open} onClose={onClose}>
            <div style={{ width: 600, padding: 20 }}>
                <IconButton onClick={onClose} style={{ position: 'relative', marginBottom: 10 }}>
                    <CloseIcon />
                </IconButton>
                {loading || !product ? (
                    <Backdrop open={loading} style={{ zIndex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                        <CircularProgress />
                    </Backdrop>
                ) : (
                    <>
                        <Typography variant="h4">{product.original_product_name}</Typography>
                        <p></p>
                        <Typography variant="h6"><strong>Текущи имена за търсене: 
                             <IconButton onClick={() => window.open(`${window.location.origin}/product-names/${encodeURIComponent(product.original_product_name)}`, '_blank')}>
                                <OpenInNewIcon />
                             </IconButton></strong>
                        </Typography>
                        <List>
                            {product.custom_product_name_variations.concat(product.generated_product_variations).map((name: string) => (
                                <ListItem key={name}>
                                    <ShoppingCartIcon style={{ marginRight: 10 }} />
                                    <ListItemText primary={name} />
                                </ListItem>
                            ))}
                        </List>
                        <Typography variant="h6"><strong>Алтернативни имена, които са намерени:</strong></Typography>
                        <Typography variant="subtitle2" style={{ fontStyle: 'italic' }}>Кликнете върху алтернативно име за да го добавите към имената за търсене</Typography>
                        {altNames.length > 0 ? (
                            altNames.map((name) => (
                                <ListItem key={name} button onClick={() => handleCheckboxChange(name)}>
                                    <Checkbox checked={false} />
                                    <ListItemText primary={name} />
                                </ListItem>
                            ))
                        ) : (
                            <Typography>Няма намерени алтернативни имена</Typography>
                        )}
                    </>
                )}
            </div>
        </Drawer>
    );
};

export default AlternativeNames;