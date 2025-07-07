"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  Checkbox,
  Typography,
  Box,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Input,
  Avatar,
  Tooltip,
  Grid,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import { Delete, Save, Cancel, Add, Edit, CloudUpload } from '@mui/icons-material';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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

// Component
const ProductManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [editedProducts, setEditedProducts] = useState<EditedProduct>({});
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<{ [key: string]: File }>({});
  const [newProduct, setNewProduct] = useState<NewProduct>({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    image: null,
  });
  const [isCreating, setIsCreating] = useState<boolean>(false);

  // Base URL for backend
  const API_URL = 'https://ollanbackend.vercel.app/api/products/';

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

const fetchProducts = async () => {
  setLoading(true);
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please log in to access products');
      setLoading(false);
      return;
    }
    console.log('Fetching from:', API_URL); // Debug log
    const response = await axios.get(API_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('Response:', response.data); // Debug log
    setProducts(response.data);
    setLoading(false);
  } catch (error: any) {
    console.error('Error fetching products:', error); // Debug log
    toast.error(error.response?.data?.message || 'Failed to fetch products');
    setLoading(false);
  }
};

  // Utility function to validate and parse numeric values
  const parseNumericValue = (value: string): number | null => {
    if (value === '' || value === null || value === undefined) {
      return null;
    }
    const parsed = parseFloat(value);
    return isNaN(parsed) ? null : parsed;
  };

  // Handle input change for inline editing
  const handleInputChange = (id: string, field: keyof Product, value: string) => {
    const product = products.find((p) => p._id === id);
    if (!product) return;

    // Handle numeric fields with proper validation
    if (field === 'price' || field === 'stock') {
      if (value === '') {
        // Allow empty input but don't add to editedProducts
        setEditedProducts((prev) => {
          const newEdits = { ...prev };
          if (newEdits[id]) {
            delete newEdits[id][field];
            if (Object.keys(newEdits[id]).length === 0) {
              delete newEdits[id];
            }
          }
          return newEdits;
        });
        return;
      }
      
      const numValue = parseNumericValue(value);
      if (numValue === null || numValue < 0) {
        return;
      }
      
      setEditedProducts((prev) => ({
        ...prev,
        [id]: {
          ...prev[id],
          [field]: numValue,
        },
      }));
    } else {
      // Handle string fields
      setEditedProducts((prev) => ({
        ...prev,
        [id]: {
          ...prev[id],
          [field]: value,
        },
      }));
    }
  };

  // Handle file input for image (edit)
  const handleImageChange = (id: string, file: File | null) => {
    if (file) {
      setSelectedImage((prev) => ({
        ...prev,
        [id]: file,
      }));
    }
  };

  // Handle new product input change
  const handleNewProductChange = (field: keyof NewProduct, value: string | File | null) => {
    setNewProduct((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Toggle product selection for batch operations
  const handleSelectProduct = (id: string) => {
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  // Create new product
  const handleCreateProduct = async () => {
    if (!newProduct.name || !newProduct.price || !newProduct.stock) {
      toast.error('Name, price, and stock are required');
      return;
    }
    
    const price = parseNumericValue(newProduct.price);
    const stock = parseNumericValue(newProduct.stock);
    
    if (price === null || price < 0) {
      toast.error('Price must be a valid non-negative number');
      return;
    }
    
    if (stock === null || stock < 0) {
      toast.error('Stock must be a valid non-negative number');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', newProduct.name);
      formData.append('description', newProduct.description);
      formData.append('price', price.toString());
      formData.append('stock', stock.toString());
      formData.append('category', newProduct.category);
      if (newProduct.image) {
        formData.append('image', newProduct.image);
      }

      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to create a product');
        setLoading(false);
        return;
      }

      await axios.post(`${API_URL}/create`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success('Product created successfully');
      setNewProduct({ name: '', description: '', price: '', stock: '', category: '', image: null });
      setIsCreating(false);
      fetchProducts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create product');
      setLoading(false);
    }
  };

  // Save batch updates
  const handleSave = async () => {
    if (Object.keys(editedProducts).length === 0) {
      toast.warn('No changes to save');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to update products');
        setLoading(false);
        return;
      }

      const updatePromises = Object.keys(editedProducts).map(async (id) => {
        const productData = editedProducts[id];
        const product = products.find((p) => p._id === id);
        if (!product) throw new Error(`Product ${id} not found`);

        // Validate required fields with proper fallbacks
        const name = productData.name !== undefined ? productData.name : product.name;
        if (!name || name.trim() === '') {
          throw new Error(`Name is required for product ${product.name}`);
        }

        const price = productData.price !== undefined ? productData.price : product.price;
        if (price === undefined || price === null || isNaN(price) || price < 0) {
          throw new Error(`Valid price is required for product ${product.name}`);
        }

        const stock = productData.stock !== undefined ? productData.stock : product.stock;
        if (stock === undefined || stock === null || isNaN(stock) || stock < 0) {
          throw new Error(`Valid stock is required for product ${product.name}`);
        }

        const formData = new FormData();
        let hasChanges = false;

        // Only append fields that have been edited
        if (productData.name !== undefined && productData.name !== product.name) {
          formData.append('name', name);
          hasChanges = true;
        }
        if (productData.description !== undefined && productData.description !== product.description) {
          formData.append('description', productData.description || '');
          hasChanges = true;
        }
        if (productData.price !== undefined && productData.price !== product.price) {
          formData.append('price', price.toString());
          hasChanges = true;
        }
        if (productData.stock !== undefined && productData.stock !== product.stock) {
          formData.append('stock', stock.toString());
          hasChanges = true;
        }
        if (productData.category !== undefined && productData.category !== product.category) {
          formData.append('category', productData.category || '');
          hasChanges = true;
        }
        if (selectedImage[id]) {
          formData.append('image', selectedImage[id]);
          hasChanges = true;
        }

        if (!hasChanges) {
          return Promise.resolve();
        }

        return axios.put(`${API_URL}/${id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        });
      });

      await Promise.all(updatePromises);
      toast.success('Products updated successfully');
      setEditedProducts({});
      setSelectedImage({});
      fetchProducts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || 'Failed to update products');
      setLoading(false);
    }
  };

  // Delete selected products
  const handleDelete = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to delete products');
        setLoading(false);
        return;
      }

      const deletePromises = selectedProducts.map((id) =>
        axios.delete(`${API_URL}/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      );
      await Promise.all(deletePromises);
      toast.success('Selected products deleted');
      setSelectedProducts([]);
      fetchProducts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete products');
      setLoading(false);
    }
  };

  // Open delete confirmation dialog
  const handleOpenDialog = () => {
    if (selectedProducts.length > 0) {
      setOpenDialog(true);
    } else {
      toast.warn('Please select at least one product to delete');
    }
  };

  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Confirm delete
  const handleConfirmDelete = () => {
    handleDelete();
    setOpenDialog(false);
  };

  // Helper function to get current value for display
  const getCurrentValue = (productId: string, field: keyof Product, originalValue: any) => {
    const editedValue = editedProducts[productId]?.[field];
    return editedValue !== undefined ? editedValue : originalValue;
  };

  // Helper function to check if a numeric field has validation errors
  const hasNumericError = (productId: string, field: 'price' | 'stock', originalValue: number) => {
    const editedValue = editedProducts[productId]?.[field];
    if (editedValue === undefined) return false;
    return isNaN(editedValue as number) || editedValue < 0;
  };

  return (
<Box sx={{ p: 4, width: '100%', mx: 'auto', backgroundColor: 'white' }}>
  {/* your content here */}
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 4, color: 'black' }}>
        Product Management
      </Typography>

      {/* Action Buttons */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Save />}
            onClick={handleSave}
            disabled={Object.keys(editedProducts).length === 0 || loading}
            sx={{ minWidth: '150px' }}
          >
            {loading ? <CircularProgress size={24} /> : 'Save Changes'}
          </Button>
          <Button
            variant="contained"
            color="error"
            startIcon={<Delete />}
            onClick={handleOpenDialog}
            disabled={selectedProducts.length === 0 || loading}
            sx={{ minWidth: '150px' }}
          >
            Delete Selected
          </Button>
        </Box>
        <Button
          variant="contained"
          color="success"
          startIcon={isCreating ? <Cancel /> : <Add />}
          onClick={() => setIsCreating(!isCreating)}
          sx={{ minWidth: '150px' }}
        >
          {isCreating ? 'Cancel' : 'Add Product'}
        </Button>
      </Box>

      {/* Create Product Form */}
        {isCreating && (
            <Card sx={{ mb: 4, boxShadow: 3 }}>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                Create New Product
                </Typography>
                <Grid container spacing={2}>
                <Grid>
                    <TextField
                    fullWidth
                    label="Name"
                    value={newProduct.name}
                    onChange={(e) => handleNewProductChange('name', e.target.value)}
                    required
                    />
                </Grid>
                <Grid >
                    <TextField
                    fullWidth
                    label="Description"
                    value={newProduct.description}
                    onChange={(e) => handleNewProductChange('description', e.target.value)}
                    />
                </Grid>
                <Grid>
                    <TextField
                    fullWidth
                    label="Price ($)"
                    type="number"
                    value={newProduct.price}
                    onChange={(e) => handleNewProductChange('price', e.target.value)}
                    required
                    />
                </Grid>
                <Grid >
                    <TextField
                    fullWidth
                    label="Stock"
                    type="number"
                    value={newProduct.stock}
                    onChange={(e) => handleNewProductChange('stock', e.target.value)}
                    required
                    />
                </Grid>
                <Grid>
                    <TextField
                    fullWidth
                    label="Category"
                    value={newProduct.category}
                    onChange={(e) => handleNewProductChange('category', e.target.value)}
                    />
                </Grid>
                <Grid>
                    <Input
                    type="file"
                    inputProps={{ accept: "image/*" }}
                    onChange={(e) =>
                        handleNewProductChange('image', (e.target as HTMLInputElement).files?.[0] || null)
                    }
                />
                </Grid>
                </Grid>
                <Box sx={{ mt: 2, textAlign: 'right' }}>
                <Button variant="contained" color="primary" onClick={handleCreateProduct}>
                    Create Product
                </Button>
                </Box>
            </CardContent>
            </Card>
        )}
    
        {/* Loading Spinner */}

      {loading && products.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress size={60} />
        </Box>
      ) : (
        /* Product Table */
        <Card sx={{ boxShadow: 3 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'primary.main' }}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      onChange={(e) =>
                        setSelectedProducts(
                          e.target.checked ? products.map((p) => p._id) : []
                        )
                      }
                      checked={selectedProducts.length === products.length && products.length > 0}
                      sx={{ color: 'common.white' }}
                    />
                  </TableCell>
                  <TableCell sx={{ color: 'common.white' }}>Image</TableCell>
                  <TableCell sx={{ color: 'common.white' }}>Name</TableCell>
                  <TableCell sx={{ color: 'common.white' }}>Description</TableCell>
                  <TableCell sx={{ color: 'common.white' }}>Price ($)</TableCell>
                  <TableCell sx={{ color: 'common.white' }}>Stock</TableCell>
                  <TableCell sx={{ color: 'common.white' }}>Category</TableCell>
                  <TableCell sx={{ color: 'common.white' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product._id} hover>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedProducts.includes(product._id)}
                        onChange={() => handleSelectProduct(product._id)}
                      />
                    </TableCell>
                    <TableCell>
                      {product.image ? (
                        <Avatar
                          src={product.image}
                          alt={product.name}
                          sx={{ width: 56, height: 56 }}
                          variant="rounded"
                        />
                      ) : (
                        <Avatar sx={{ width: 56, height: 56 }} variant="rounded">
                          {product.name.charAt(0)}
                        </Avatar>
                      )}
                      <Input
                        type="file"
                        onChange={(e) =>
                          handleImageChange(product._id, (e.target as HTMLInputElement).files?.[0] || null)
                        }
                        sx={{ display: 'none' }}
                        id={`image-upload-${product._id}`}
                      />
                      <label htmlFor={`image-upload-${product._id}`}>
                        <Button
                          component="span"
                          size="small"
                          startIcon={<Edit />}
                          sx={{ mt: 1 }}
                        >
                          Change
                        </Button>
                      </label>
                    </TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        value={getCurrentValue(product._id, 'name', product.name)}
                        onChange={(e) => handleInputChange(product._id, 'name', e.target.value)}
                        size="small"
                        error={editedProducts[product._id]?.name === ''}
                        helperText={
                          editedProducts[product._id]?.name === '' ? 'Name is required' : ''
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        value={getCurrentValue(product._id, 'description', product.description || '')}
                        onChange={(e) =>
                          handleInputChange(product._id, 'description', e.target.value)
                        }
                        size="small"
                        multiline
                        rows={2}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        type="number"
                        value={getCurrentValue(product._id, 'price', product.price)}
                        onChange={(e) => handleInputChange(product._id, 'price', e.target.value)}
                        size="small"
                        error={hasNumericError(product._id, 'price', product.price)}
                        helperText={
                          hasNumericError(product._id, 'price', product.price)
                            ? 'Price must be ≥ 0'
                            : ''
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        type="number"
                        value={getCurrentValue(product._id, 'stock', product.stock)}
                        onChange={(e) => handleInputChange(product._id, 'stock', e.target.value)}
                        size="small"
                        error={hasNumericError(product._id, 'stock', product.stock)}
                        helperText={
                          hasNumericError(product._id, 'stock', product.stock)
                            ? 'Stock must be ≥ 0'
                            : ''
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        value={getCurrentValue(product._id, 'category', product.category || '')}
                        onChange={(e) =>
                          handleInputChange(product._id, 'category', e.target.value)
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Discard changes">
                        <IconButton
                          onClick={() => {
                            setEditedProducts((prev) => {
                              const newEdits = { ...prev };
                              delete newEdits[product._id];
                              return newEdits;
                            });
                            setSelectedImage((prev) => {
                              const newImages = { ...prev };
                              delete newImages[product._id];
                              return newImages;
                            });
                          }}
                          disabled={!editedProducts[product._id] && !selectedImage[product._id]}
                        >
                          <Cancel color={editedProducts[product._id] || selectedImage[product._id] ? "error" : "disabled"} />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {selectedProducts.length} selected product(s)? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <ToastContainer position="top-right" autoClose={5000} />
    </Box>
  );
};

export default ProductManagement;