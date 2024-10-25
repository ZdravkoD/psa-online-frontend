import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
} from "@mui/material";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import AlternativeNames from "../AlternativeNames/AlternativeNames";

interface UnboughtProduct {
  product_name: string;
  quantity: number;
  alternative_names: string[];
}

interface UnboughtProductsTableProps {
  products: UnboughtProduct[];
}

const UnboughtProductsTable: React.FC<UnboughtProductsTableProps> = (
  unboughtProductsTableProps
) => {
  const [isAlternativeNamesDrawerOpen, setAlternativeNamesDrawerOpen] =
    useState(false);

  return (
    <TableContainer component={Paper} elevation={4} sx={{ mt: 4, mb: 4 }}>
      <Typography
        variant="h6"
        component="div"
        sx={{ padding: "16px", backgroundColor: "#f5f5f5", color: "#3f51b5" }}
      >
        Списък с незакупени продукти (
        {unboughtProductsTableProps.products.length})
      </Typography>
      <Table sx={{ minWidth: 450 }} aria-label="unbought products table">
        <TableHead>
          <TableRow sx={{ backgroundColor: "#e0e0e0" }}>
            <TableCell>Продукт</TableCell>
            <TableCell align="right">Брой</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {unboughtProductsTableProps.products.map((product) => (
            <TableRow
              key={product.product_name}
              hover
              sx={{
                backgroundColor:
                  product.alternative_names.length > 0 ? "#00ffff" : "inherit",
              }}
            >
              <TableCell component="th" scope="row">
                <div
                  style={{
                    display: "flex",
                    alignItems: "left",
                    justifyContent: "left",
                  }}
                >
                  {product.product_name}
                  {product.alternative_names && (
                    <>
                      <div>
                        <button
                          onClick={() => setAlternativeNamesDrawerOpen(true)}
                          style={{
                            marginLeft: "8px",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          <Typography variant="body2" color="error">
                            <AddShoppingCartIcon />
                          </Typography>
                        </button>
                        {isAlternativeNamesDrawerOpen && (
                          <AlternativeNames
                            open={isAlternativeNamesDrawerOpen}
                            onClose={() => setAlternativeNamesDrawerOpen(false)}
                            productName={product.product_name}
                            alternativeNames={product.alternative_names || []}
                          />
                        )}
                      </div>
                    </>
                  )}
                </div>
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
