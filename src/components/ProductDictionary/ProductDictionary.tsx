import React, { useState, useEffect } from "react";
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
  ListItemText,
  CircularProgress,
} from "@mui/material";
import { apiGet, apiPatch } from "../../api/client";
import { useParams } from "react-router-dom";
import ReorderableList from "../ReordableList/ReordableList";
import { Product } from "../../types/product";

const ProductDictionary: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [pendingSearchTerm, setPendingSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize] = useState<number>(10);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [httpError, setHttpError] = useState<string | null>(null);
  const { searchTermParam } = useParams<{ searchTermParam: string }>();

  useEffect(() => {
    if (searchTermParam) {
      setPendingSearchTerm(searchTermParam);
      handleSearch({
        target: { value: searchTermParam },
      } as React.ChangeEvent<HTMLInputElement>);
    }
  }, [searchTermParam]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await apiGet<{
          items: Product[];
          total_count: number;
        }>('/products', {
          filter: JSON.stringify({ original_product_name: searchTerm }),
          skip: (currentPage - 1) * pageSize,
          limit: pageSize,
        });
        setProducts(response.items);
        setTotalCount(response.total_count);
        setHttpError(null);
      } catch (error) {
        console.error("Error fetching products:", error);
        setHttpError("Грешка при заявка на продуктите. Моля опитайте отново.");
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

  const handleCustomVariationsChange = async (
    id: string,
    variations: string[]
  ): Promise<Error | void> => {
    try {
      const modifiedProduct = await apiPatch<Product>(`/product/${id}`, {
        custom_product_name_variations: variations,
      });
      setProducts(
        products.map((product) =>
          product.id === id ? modifiedProduct : product
        )
      );
      setHttpError(null);
    } catch (error) {
      console.error("Error updating custom variations:", error);
      setHttpError("Грешка при актуализиране на персонализираните вариации");
      return Promise.reject(error);
    }
    return Promise.resolve();
  };

  return (
    <div>
      {httpError && (
        <div
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            zIndex: 1000,
          }}
        >
          <Typography
            color="error"
            variant="body1"
            style={{
              backgroundColor: "white",
              padding: "10px",
              borderRadius: "5px",
              boxShadow: "0px 0px 10px rgba(0,0,0,0.1)",
            }}
          >
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
        <Typography
          variant="h6"
          component="div"
          sx={{
            padding: "16px",
            backgroundColor: "#f5f5f5",
            color: "#3f51b5",
            display: "flex",
            alignItems: "center",
          }}
        >
          Продукти{" "}
          {loading && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginLeft: "10px",
              }}
            >
              <CircularProgress size={24} />
            </div>
          )}
        </Typography>

        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#e0e0e0" }}>
              <TableCell>
                <strong>Оригинално име на продукта</strong>
              </TableCell>
              <TableCell>
                <strong>Генерирани вариации на продукта</strong>
              </TableCell>
              <TableCell>
                <strong>Персонализирани вариации на името на продукта</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id} hover>
                <TableCell>{product.original_product_name}</TableCell>
                <TableCell>
                  <List>
                    {product.generated_product_variations.map(
                      (variation, index) => (
                        <ListItem key={index}>
                          <ListItemText primary={variation} />
                        </ListItem>
                      )
                    )}
                  </List>
                </TableCell>
                <TableCell>
                  <ReorderableList
                    initialItems={product.custom_product_name_variations.map(
                      (variation, index) => ({
                        id: index.toString(),
                        text: variation,
                      })
                    )}
                    onReorder={async (
                      newOrder: { id: string; text: string }[]
                    ) => {
                      try {
                        await handleCustomVariationsChange(
                          product.id,
                          newOrder.map((v) => v.text)
                        );
                      } catch (error) {
                        console.error(
                          "Error reordering custom variations:",
                          error
                        );
                      }
                    }}
                  />
                  <TextField
                    placeholder="Add new variation"
                    onKeyDown={async (e) => {
                      const inputValue = (
                        e.target as HTMLInputElement
                      )?.value?.trim();
                      if (e.key === "Enter" && inputValue !== "") {
                        try {
                          const newVariations = [
                            ...product.custom_product_name_variations,
                            inputValue,
                          ];
                          await handleCustomVariationsChange(
                            product.id,
                            newVariations
                          );
                          (e.target as HTMLInputElement).value = "";
                        } catch (error) {
                          console.error("Error adding new variation:", error);
                        }
                      }
                    }}
                    variant="standard"
                    fullWidth
                  />
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
