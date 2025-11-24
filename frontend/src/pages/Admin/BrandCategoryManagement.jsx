import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Alert
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { getBrands, addBrand, deleteBrand } from '../../redux/slices/brandSlice';
import { getCategories, addCategory, deleteCategory } from '../../redux/slices/categorySlice';
import { toast } from 'react-toastify';

const BrandCategoryManagement = () => {
  const dispatch = useDispatch();
  const { brands, loading: brandLoading } = useSelector(state => state.brands);
  const { categories, loading: categoryLoading } = useSelector(state => state.categories);
  
  const [newBrand, setNewBrand] = useState('');
  const [newCategory, setNewCategory] = useState('');

  useEffect(() => {
    dispatch(getBrands());
    dispatch(getCategories());
  }, [dispatch]);

  const handleAddBrand = async () => {
    if (!newBrand.trim()) {
      toast.error('Please enter a brand name');
      return;
    }
    
    try {
      await dispatch(addBrand({ name: newBrand.trim() })).unwrap();
      setNewBrand('');
      toast.success('Brand added successfully');
    } catch (error) {
      toast.error(error);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      toast.error('Please enter a category name');
      return;
    }
    
    try {
      await dispatch(addCategory({ name: newCategory.trim() })).unwrap();
      setNewCategory('');
      toast.success('Category added successfully');
    } catch (error) {
      toast.error(error);
    }
  };

  const handleDeleteBrand = async (brandId) => {
    if (window.confirm('Are you sure you want to delete this brand?')) {
      try {
        await dispatch(deleteBrand(brandId)).unwrap();
        toast.success('Brand deleted successfully');
      } catch (error) {
        toast.error(error);
      }
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await dispatch(deleteCategory(categoryId)).unwrap();
        toast.success('Category deleted successfully');
      } catch (error) {
        toast.error(error);
      }
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        Brand & Category Management
      </Typography>
      
      <Grid container spacing={4}>
        {/* Brand Management */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Brand Management
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="New Brand Name"
                value={newBrand}
                onChange={(e) => setNewBrand(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddBrand()}
                sx={{ mb: 2 }}
              />
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleAddBrand}
                disabled={brandLoading}
                fullWidth
              >
                Add Brand
              </Button>
            </Box>

            <Divider sx={{ mb: 2 }} />

            <Typography variant="h6" gutterBottom>
              Current Brands ({brands.length})
            </Typography>
            
            {brands.length === 0 ? (
              <Alert severity="info">No brands available</Alert>
            ) : (
              <List>
                {brands.map((brand) => (
                  <ListItem key={brand._id} divider>
                    <ListItemText primary={brand.name} />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        color="error"
                        onClick={() => handleDeleteBrand(brand._id)}
                      >
                        <Delete />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        {/* Category Management */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Category Management
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="New Category Name"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                sx={{ mb: 2 }}
              />
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleAddCategory}
                disabled={categoryLoading}
                fullWidth
              >
                Add Category
              </Button>
            </Box>

            <Divider sx={{ mb: 2 }} />

            <Typography variant="h6" gutterBottom>
              Current Categories ({categories.length})
            </Typography>
            
            {categories.length === 0 ? (
              <Alert severity="info">No categories available</Alert>
            ) : (
              <List>
                {categories.map((category) => (
                  <ListItem key={category._id} divider>
                    <ListItemText primary={category.name} />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        color="error"
                        onClick={() => handleDeleteCategory(category._id)}
                      >
                        <Delete />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default BrandCategoryManagement;