// src/components/ProductManagement.tsx
"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Badge,
  IconButton,
  CircularProgress,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
} from "@mui/material";
import { Add, Close, SelectAll } from "@mui/icons-material";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProductCard from "./ProductCard";
import CreateProductForm from "./CreateProductForm";
import SearchAndFilters from "./SearchAndFilters";
import SelectionModeHeader from "./SelectionModeHeader";
import DeleteConfirmationDialog from "./DeleteConfirmationDialog";

// Define TypeScript interfaces
interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category?: string;
  image?: string | null;
  imagePublicId?: string | null;
  createdBy?: { name: string; email: string } | null;
}

interface EditedProduct {
  [key: string]: Partial<Product>;
}

interface NewProduct {
  name: string;
  description: string;
  price: string;
  stock: string;
  category: string;
  image: File | null;
}

const ProductManagement: React.FC = () => {
  // State management
  const [products, setProducts] = useState<Product[]>([]);
  const [editedProducts, setEditedProducts] = useState<EditedProduct>({});
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<{ [key: string]: File }>({});
  const [newProduct, setNewProduct] = useState<NewProduct>({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    image: null,
  });
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [selectionMode, setSelectionMode] = useState<boolean>(false);

  // Base URL for backend
  const API_URL = "https://ollanbackend.vercel.app/api/products";

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please log in to access products");
        setLoading(false);
        return;
      }
      // Mock data for testing (uncomment to use)
      /*
      const mockProducts = [
        {
          _id: "1",
          name: "Paracetamol",
          description: "Pain reliever",
          price: 500,
          stock: 100,
          category: "Pain reliever",
          image: "/images/paracetamol.jpg",
        },
        {
          _id: "2",
          name: "Vitamin C",
          description: "Immune booster",
          price: 1000,
          stock: 50,
          category: "Vitamins and Supplements",
          image: "/images/vitamin-c.jpg",
        },
      ];
      setProducts(mockProducts);
      */
      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(response.data);
      setLoading(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch products. Please check your internet connection.");
      setLoading(false);
    }
  };

  // Memoized filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === "all" || product.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, filterCategory]);

  // Memoized categories
  const categories = useMemo(() => {
    return Array.from(
      new Set(products.map((p) => p.category).filter((cat): cat is string => typeof cat === "string"))
    );
  }, [products]);

  // Handle create product
  const handleCreateProduct = async () => {
    if (!newProduct.name || !newProduct.price || !newProduct.stock || !newProduct.category) {
      toast.warn("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please log in to create products");
        setLoading(false);
        return;
      }
      const formData = new FormData();
      formData.append("name", newProduct.name);
      formData.append("description", newProduct.description);
      formData.append("price", newProduct.price);
      formData.append("stock", newProduct.stock);
      formData.append("category", newProduct.category);
      if (newProduct.image) {
        formData.append("image", newProduct.image);
      }
      await axios.post(`${API_URL}/create`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Product created successfully.");
      setIsCreating(false);
      setNewProduct({
        name: "",
        description: "",
        price: "",
        stock: "",
        category: "",
        image: null,
      });
      fetchProducts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create product.");
    } finally {
      setLoading(false);
    }
  };

  // Handle save product
  const handleSaveProduct = async (productId: string): Promise<void> => {
    const edited = editedProducts[productId];
    if (!edited || Object.keys(edited).length === 0) {
      toast.info("No changes to save.");
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please log in to update products");
        setLoading(false);
        return;
      }

      let updatedFields = { ...edited };
      if (selectedImage[productId]) {
        const formData = new FormData();
        formData.append("image", selectedImage[productId]);
        const imageRes = await axios.post(`${API_URL}/${productId}/upload-image`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        updatedFields.image = imageRes.data.image;
        updatedFields.imagePublicId = imageRes.data.imagePublicId;
      }

      await axios.put(`${API_URL}/${productId}`, updatedFields, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Product updated successfully.");
      setProducts((prev) =>
        prev.map((p) => (p._id === productId ? { ...p, ...updatedFields } : p))
      );
      setEditedProducts((prev) => {
        const newEdited = { ...prev };
        delete newEdited[productId];
        return newEdited;
      });
      setSelectedImage((prev) => {
        const newSelected = { ...prev };
        delete newSelected[productId];
        return newSelected;
      });
      setEditingProduct(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update product.");
    } finally {
      setLoading(false);
    }
  };

  // Handle select product
  const handleSelectProduct = useCallback((productId: string) => {
    console.log("Selecting product:", productId, "Current selected:", selectedProducts); // Debug log
    setSelectedProducts((prevSelected) =>
      prevSelected.includes(productId)
        ? prevSelected.filter((id) => id !== productId)
        : [...prevSelected, productId]
    );
  }, [selectedProducts]);

  // Handle selection mode
  const toggleSelectionMode = useCallback(() => {
    console.log("Toggling selection mode, current:", selectionMode); // Debug log
    setSelectionMode((prev) => !prev);
    if (selectionMode) {
      setSelectedProducts([]);
    }
  }, [selectionMode]);

  // Handle delete dialog
  const handleOpenDialog = useCallback(() => {
    console.log("Opening delete dialog, selected products:", selectedProducts); // Debug log
    if (selectedProducts.length > 0) {
      setOpenDialog(true);
    } else {
      toast.warn("Please select at least one product to delete");
    }
  }, [selectedProducts]);

  const handleCloseDialog = useCallback(() => {
    console.log("Closing delete dialog"); // Debug log
    setOpenDialog(false);
  }, []);

  // Handle confirm delete
  const handleConfirmDelete = useCallback(() => {
    console.log("Confirming delete, selected products:", selectedProducts); // Debug log
    setOpenDialog(false);
    handleDelete();
  }, [selectedProducts]);

  // Handle delete products
  const handleDelete = async () => {
    console.log("Attempting to delete products:", selectedProducts); // Debug log
    if (selectedProducts.length === 0) {
      toast.warn("No products selected for deletion.");
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please log in to delete products");
        setLoading(false);
        return;
      }

      // Send individual DELETE requests for each product
      const deletePromises = selectedProducts.map((id) =>
        axios.delete(`${API_URL}/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      );
      await Promise.all(deletePromises);

      toast.success("Selected products deleted successfully.");
      setProducts((prev) => prev.filter((p) => !selectedProducts.includes(p._id)));
      setSelectedProducts([]);
      setSelectionMode(false);
    } catch (error: any) {
      const message =
        error.response?.status === 401
          ? "Unauthorized: Please log in again."
          : error.response?.status === 404
          ? "One or more products not found."
          : error.code === "ECONNABORTED"
          ? "Request timed out. Please check your internet connection."
          : error.response?.data?.message || "Failed to delete products.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "background.default" }}>
      {/* Mobile Header */}
      <AppBar position="sticky" sx={{ mb: 2 }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: "bold" }}>
            Product Management
          </Typography>
          {selectionMode && (
            <Badge badgeContent={selectedProducts.length} color="secondary">
              <IconButton color="inherit" onClick={toggleSelectionMode}>
                <Close />
              </IconButton>
            </Badge>
          )}
          {!selectionMode && (
            <IconButton color="inherit" onClick={() => setIsCreating(!isCreating)}>
              <Add />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box sx={{ maxWidth: { xs: "100%", sm: 600, md: 960, lg: 1280, xl: 1920 }, mx: "auto", px: { xs: 2, sm: 3, md: 4 }, pb: 10 }}>
        {/* Search and Filters */}
        <SearchAndFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterCategory={filterCategory}
          setFilterCategory={setFilterCategory}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          categories={categories}
        />

        {/* Selection Mode Header */}
        {selectionMode && (
          <SelectionModeHeader
            selectedProducts={selectedProducts}
            filteredProducts={filteredProducts}
            setSelectedProducts={setSelectedProducts}
            handleOpenDialog={handleOpenDialog}
          />
        )}

        {/* Create Product Form */}
        {isCreating && (
          <CreateProductForm
            newProduct={newProduct}
            setNewProduct={setNewProduct}
            loading={loading}
            handleCreateProduct={handleCreateProduct}
            setIsCreating={setIsCreating}
            fetchProducts={fetchProducts}
          />
        )}

        {/* Products List */}
        {loading && products.length === 0 ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress size={60} />
          </Box>
        ) : (
          <Box>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: "bold" }}>
              {filteredProducts.length} Product{filteredProducts.length !== 1 ? "s" : ""}
            </Typography>
            {filteredProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                editedProducts={editedProducts}
                setEditedProducts={setEditedProducts}
                selectedImage={selectedImage}
                setSelectedImage={setSelectedImage}
                expandedCards={expandedCards}
                setExpandedCards={setExpandedCards}
                editingProduct={editingProduct}
                setEditingProduct={setEditingProduct}
                loading={loading}
                selectionMode={selectionMode}
                selectedProducts={selectedProducts}
                setSelectedProducts={setSelectedProducts}
                handleSaveProduct={handleSaveProduct}
                handleSelectProduct={handleSelectProduct}
              />
            ))}
          </Box>
        )}

        {/* Empty State */}
        {filteredProducts.length === 0 && !loading && (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              No products found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try adjusting your search or filters
            </Typography>
          </Box>
        )}
      </Box>

      {/* Floating Action Button */}
      <SpeedDial
        ariaLabel="Product actions"
        sx={{ position: "fixed", bottom: 16, right: 16 }}
        icon={<SpeedDialIcon />}
      >
        <SpeedDialAction
          icon={<Add />}
          tooltipTitle="Create Product"
          onClick={() => setIsCreating(!isCreating)}
        />
        <SpeedDialAction
          icon={<SelectAll />}
          tooltipTitle="Select Mode"
          onClick={toggleSelectionMode}
        />
      </SpeedDial>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        openDialog={openDialog}
        selectedProducts={selectedProducts}
        handleCloseDialog={handleCloseDialog}
        handleConfirmDelete={handleConfirmDelete}
        handleDelete={handleDelete}
      />

      <ToastContainer position="top-center" autoClose={3000} />
    </Box>
  );
};

export default ProductManagement;