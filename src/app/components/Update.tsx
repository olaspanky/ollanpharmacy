"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  CardActions,
  Grid,
  Chip,
  Avatar,
  Fab,
  IconButton,
  Collapse,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Divider,
  Paper,
  useTheme,
  useMediaQuery,
  Checkbox,
  FormControlLabel,
  AppBar,
  Toolbar,
  Badge,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Container,
} from '@mui/material';
import {
  Delete,
  Save,
  Add,
  Edit,
  CloudUpload,
  ExpandMore,
  FilterList,
  Search,
  Close,
  CheckCircle,
  Cancel,
  Inventory,
  AttachMoney,
  Category,
  Image,
  SelectAll,
  Clear,
} from '@mui/icons-material';
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

const ProductManagement: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  
  // State management
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
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [selectionMode, setSelectionMode] = useState<boolean>(false);

  // Base URL for backend
  const API_URL = 'https://ollanbackend.vercel.app/api/products';

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
      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(response.data);
      setLoading(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch products');
      setLoading(false);
    }
  };

  // Utility functions
  const parseNumericValue = (value: string): number | null => {
    if (value === '' || value === null || value === undefined) return null;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? null : parsed;
  };

  const getCurrentValue = (productId: string, field: keyof Product, originalValue: any) => {
    const editedValue = editedProducts[productId]?.[field];
    return editedValue !== undefined ? editedValue : originalValue;
  };

  const hasNumericError = (productId: string, field: 'price' | 'stock', originalValue: number) => {
    const editedValue = editedProducts[productId]?.[field];
    if (editedValue === undefined) return false;
    return isNaN(editedValue as number) || editedValue < 0;
  };

  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories
  const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean)));

  // Handle input changes
  const handleInputChange = useCallback((id: string, field: keyof Product, value: string) => {
  const product = products.find((p) => p._id === id);
  if (!product) return;

  if (field === 'price' || field === 'stock') {
    if (value === '') {
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
    if (numValue === null || numValue < 0) return;
    
    setEditedProducts((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: numValue },
    }));
  } else {
    setEditedProducts((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  }
}, [products]); // Add dependencies for useCallback


  const handleImageChange = (id: string, file: File | null) => {
    if (file) {
      setSelectedImage((prev) => ({ ...prev, [id]: file }));
    }
  };

  const handleNewProductChange = (field: keyof NewProduct, value: string | File | null) => {
    setNewProduct((prev) => ({ ...prev, [field]: value }));
  };

  const toggleCardExpansion = (id: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleSelectProduct = (id: string) => {
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map(p => p._id));
    }
  };

  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    if (selectionMode) {
      setSelectedProducts([]);
    }
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

  // Save updates for a single product
  const handleSaveProduct = async (productId: string) => {
    if (!editedProducts[productId] && !selectedImage[productId]) {
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

      const productData = editedProducts[productId];
      const product = products.find((p) => p._id === productId);
      if (!product) throw new Error(`Product not found`);

      const formData = new FormData();
      let hasChanges = false;

      if (productData) {
        Object.keys(productData).forEach(key => {
          const field = key as keyof Product;
          const value = productData[field];
          if (value !== undefined && value !== null && value !== product[field]) {
            formData.append(key, value.toString());
            hasChanges = true;
          }
        });
      }

      if (selectedImage[productId]) {
        formData.append('image', selectedImage[productId]);
        hasChanges = true;
      }

      if (!hasChanges) {
        setLoading(false);
        return;
      }

      await axios.put(`${API_URL}/${productId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success('Product updated successfully');
      
      // Clear edits for this product
      setEditedProducts(prev => {
        const newEdits = { ...prev };
        delete newEdits[productId];
        return newEdits;
      });
      
      setSelectedImage(prev => {
        const newImages = { ...prev };
        delete newImages[productId];
        return newImages;
      });
      
      setEditingProduct(null);
      fetchProducts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update product');
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
      setSelectionMode(false);
      fetchProducts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete products');
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    if (selectedProducts.length > 0) {
      setOpenDialog(true);
    } else {
      toast.warn('Please select at least one product to delete');
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleConfirmDelete = () => {
    handleDelete();
    setOpenDialog(false);
  };

  // Mobile Product Card Component
  // Memoized ProductCard component
const ProductCard = React.memo(({ product }: { product: Product }) => {
  const isExpanded = expandedCards.has(product._id);
  const isEditing = editingProduct === product._id;
  const hasChanges = editedProducts[product._id] || selectedImage[product._id];

  return (
    <Card 
      key={product._id} 
      sx={{ 
        mb: 2, 
        boxShadow: hasChanges ? 3 : 1,
        border: hasChanges ? 2 : 1,
        borderColor: hasChanges ? 'primary.main' : 'divider',
        transition: 'all 0.3s ease',
      }}
    >
      <CardContent sx={{ pb: 1 }}>
        {/* Product Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {selectionMode && (
            <Checkbox
              checked={selectedProducts.includes(product._id)}
              onChange={() => handleSelectProduct(product._id)}
              sx={{ mr: 1 }}
            />
          )}
          <Avatar
            src={product.image || undefined}
            alt={product.name}
            sx={{ width: 48, height: 48, mr: 2 }}
            variant="rounded"
          >
            {product.name.charAt(0)}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }} noWrap>
              {product.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              <Chip
                label={`$${product.price}`}
                size="small"
                color="primary"
                icon={<AttachMoney />}
              />
              <Chip
                label={`Stock: ${product.stock}`}
                size="small"
                color={product.stock > 0 ? 'success' : 'error'}
                icon={<Inventory />}
              />
            </Box>
          </Box>
          <IconButton
            onClick={() => toggleCardExpansion(product._id)}
            sx={{ ml: 1 }}
          >
            <ExpandMore
              sx={{
                transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s ease',
              }}
            />
          </IconButton>
        </Box>

        {/* Quick Info */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          {product.category && (
            <Chip
              label={product.category}
              size="small"
              variant="outlined"
              icon={<Category />}
            />
          )}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton
              size="small"
              onClick={() => setEditingProduct(isEditing ? null : product._id)}
              color={isEditing ? 'primary' : 'default'}
            >
              <Edit />
            </IconButton>
            {hasChanges && (
              <IconButton
                size="small"
                onClick={() => handleSaveProduct(product._id)}
                color="success"
                disabled={loading}
              >
                <CheckCircle />
              </IconButton>
            )}
          </Box>
        </Box>

        {/* Expanded Content */}
        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
          <Divider sx={{ mb: 2 }} />
          
          {/* Edit Mode */}
          {isEditing ? (
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Name"
                value={getCurrentValue(product._id, 'name', product.name)}
                onChange={(e) => handleInputChange(product._id, 'name', e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
                size="small"
                error={editedProducts[product._id]?.name === ''}
                helperText={editedProducts[product._id]?.name === '' ? 'Name is required' : ''}
                autoFocus // Add autoFocus to keep cursor in field
              />
              
              <TextField
                fullWidth
                label="Description"
                value={getCurrentValue(product._id, 'description', product.description || '')}
                onChange={(e) => handleInputChange(product._id, 'description', e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
                size="small"
                multiline
                rows={2}
              />
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  label="Price ($)"
                  type="number"
                  value={getCurrentValue(product._id, 'price', product.price)}
                  onChange={(e) => handleInputChange(product._id, 'price', e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
                  size="small"
                  error={hasNumericError(product._id, 'stock', product.stock)}
                  helperText={hasNumericError(product._id, 'stock', product.stock) ? 'Stock must be ≥ 0' : ''}
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="Stock"
                  type="number"
                  value={getCurrentValue(product._id, 'stock', product.stock)}
                  onChange={(e) => handleInputChange(product._id, 'stock', e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
                  size="small"
                  error={hasNumericError(product._id, 'stock', product.stock)}
                  helperText={hasNumericError(product._id, 'stock', product.stock) ? 'Stock must be ≥ 0' : ''}
                  sx={{ flex: 1 }}
                />
              </Box>
              
              <TextField
                fullWidth
                label="Category"
                value={getCurrentValue(product._id, 'category', product.category || '')}
                onChange={(e) => handleInputChange(product._id, 'category', e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
                size="small"
              />
              
              <Box>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id={`image-upload-${product._id}`}
                  type="file"
                  onChange={(e) => handleImageChange(product._id, e.target.files?.[0] || null)}
                />
                <label htmlFor={`image-upload-${product._id}`}>
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<CloudUpload />}
                    size="small"
                    fullWidth
                  >
                    Change Image
                  </Button>
                </label>
                {selectedImage[product._id] && (
                  <Typography variant="caption" color="success.main" sx={{ mt: 1, display: 'block' }}>
                    New image selected: {selectedImage[product._id].name}
                  </Typography>
                )}
              </Box>
            </Stack>
          ) : (
            /* View Mode */
            <Box>
              {product.description && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {product.description}
                </Typography>
              )}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <Chip label={`ID: ${product._id.slice(-6)}`} size="small" variant="outlined" />
                {product.createdBy && (
                  <Chip label={`By: ${product.createdBy.name}`} size="small" variant="outlined" />
                )}
              </Box>
            </Box>
          )}
        </Collapse>
      </CardContent>
    </Card>
  );
});

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      {/* Mobile Header */}
      <AppBar position="sticky" sx={{ mb: 2 }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            Product Management
          </Typography>
          {selectionMode && (
            <Badge badgeContent={selectedProducts.length} color="secondary">
              <IconButton color="inherit" onClick={toggleSelectionMode}>
                <Close />
              </IconButton>
            </Badge>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ pb: 10 }}>
        {/* Search and Filters */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <TextField
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              sx={{ flex: 1 }}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
            <IconButton onClick={() => setShowFilters(!showFilters)}>
              <FilterList />
            </IconButton>
          </Box>

          <Collapse in={showFilters}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={filterCategory}
                  label="Category"
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <MenuItem value="all">All Categories</MenuItem>
                  {categories.map(category => (
                    <MenuItem key={category} value={category}>{category}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <Button
                variant="outlined"
                onClick={() => {
                  setSearchTerm('');
                  setFilterCategory('all');
                }}
                startIcon={<Clear />}
                size="small"
              >
                Clear
              </Button>
            </Box>
          </Collapse>
        </Paper>

        {/* Selection Mode Header */}
        {selectionMode && (
          <Paper sx={{ p: 2, mb: 2, backgroundColor: 'primary.50' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                {selectedProducts.length} selected
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  onClick={handleSelectAll}
                  startIcon={<SelectAll />}
                  size="small"
                >
                  {selectedProducts.length === filteredProducts.length ? 'Deselect All' : 'Select All'}
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={handleOpenDialog}
                  startIcon={<Delete />}
                  size="small"
                  disabled={selectedProducts.length === 0}
                >
                  Delete
                </Button>
              </Box>
            </Box>
          </Paper>
        )}

        {/* Create Product Form */}
        {isCreating && (
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Create New Product
              </Typography>
              <Stack spacing={2}>
                <TextField
                  fullWidth
                  label="Name"
                  value={newProduct.name}
                  onChange={(e) => handleNewProductChange('name', e.target.value)}
                  required
                  size="small"
                />
                <TextField
                  fullWidth
                  label="Description"
                  value={newProduct.description}
                  onChange={(e) => handleNewProductChange('description', e.target.value)}
                  multiline
                  rows={2}
                  size="small"
                />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    label="Price ($)"
                    type="number"
                    value={newProduct.price}
                    onChange={(e) => handleNewProductChange('price', e.target.value)}
                    required
                    size="small"
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    label="Stock"
                    type="number"
                    value={newProduct.stock}
                    onChange={(e) => handleNewProductChange('stock', e.target.value)}
                    required
                    size="small"
                    sx={{ flex: 1 }}
                  />
                </Box>
                <TextField
                  fullWidth
                  label="Category"
                  value={newProduct.category}
                  onChange={(e) => handleNewProductChange('category', e.target.value)}
                  size="small"
                />
                <Box>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="new-product-image"
                    type="file"
                    onChange={(e) => handleNewProductChange('image', e.target.files?.[0] || null)}
                  />
                  <label htmlFor="new-product-image">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<CloudUpload />}
                      fullWidth
                    >
                      Upload Image
                    </Button>
                  </label>
                  {newProduct.image && (
                    <Typography variant="caption" color="success.main" sx={{ mt: 1, display: 'block' }}>
                      Selected: {newProduct.image.name}
                    </Typography>
                  )}
                </Box>
              </Stack>
            </CardContent>
            <CardActions>
              <Button
                variant="contained"
                onClick={handleCreateProduct}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                fullWidth
              >
                Create Product
              </Button>
            </CardActions>
          </Card>
        )}

        {/* Products List */}
        {loading && products.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={60} />
          </Box>
        ) : (
          <Box>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
              {filteredProducts.length} Product{filteredProducts.length !== 1 ? 's' : ''}
            </Typography>
            {filteredProducts.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </Box>
        )}

        {/* Empty State */}
        {filteredProducts.length === 0 && !loading && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              No products found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try adjusting your search or filters
            </Typography>
          </Box>
        )}
      </Container>

      {/* Floating Action Button */}
      <SpeedDial
        ariaLabel="Product actions"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        icon={<SpeedDialIcon />}
      >
        
        <SpeedDialAction
          icon={<SelectAll />}
          tooltipTitle="Select Mode"
          onClick={toggleSelectionMode}
        />
      </SpeedDial>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {selectedProducts.length} selected product(s)? 
            This action cannot be undone.
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

      <ToastContainer position="top-center" autoClose={3000} />
    </Box>
  );
};

export default ProductManagement;