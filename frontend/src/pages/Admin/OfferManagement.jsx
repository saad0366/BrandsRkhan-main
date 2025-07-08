import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Chip,
  Tooltip,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  OutlinedInput,
  Checkbox,
  ListItemText,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  LocalOffer,
  CheckCircle,
  Cancel,
  Schedule,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { 
  getAllOffers, 
  createNewOffer, 
  updateExistingOffer, 
  deleteExistingOffer,
  clearError 
} from '../../redux/slices/offerSlice';
import { getProducts } from '../../redux/slices/productSlice';

const validationSchema = Yup.object({
  name: Yup.string().required('Offer name is required'),
  description: Yup.string().required('Description is required'),
  discountPercentage: Yup.number()
    .min(1, 'Discount must be at least 1%')
    .max(100, 'Discount cannot exceed 100%')
    .required('Discount percentage is required'),
  startDate: Yup.date().required('Start date is required'),
  endDate: Yup.date()
    .min(Yup.ref('startDate'), 'End date must be after start date')
    .required('End date is required'),
});

const OfferManagement = () => {
  const dispatch = useDispatch();
  const { allOffers, loading, error } = useSelector(state => state.offers);
  const { items: products } = useSelector(state => state.products);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [offerToDelete, setOfferToDelete] = useState(null);
  const [bannerImage, setBannerImage] = useState(null);
  const [applicableProducts, setApplicableProducts] = useState([]);
  const [applicableCategories, setApplicableCategories] = useState([]);

  useEffect(() => {
    dispatch(getAllOffers());
    dispatch(getProducts({ limit: 1000 }));
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleCreateOffer = () => {
    setEditingOffer(null);
    setDialogOpen(true);
  };

  const handleEditOffer = (offer) => {
    setEditingOffer(offer);
    setDialogOpen(true);
  };

  const handleDeleteOffer = (offer) => {
    setOfferToDelete(offer);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        formData.append(key, value);
      });
      if (bannerImage) {
        formData.append('bannerImage', bannerImage);
      }
      applicableProducts.forEach(id => formData.append('applicableProducts', id));
      applicableCategories.forEach(cat => formData.append('applicableCategories', cat));
      if (editingOffer) {
        await dispatch(updateExistingOffer({ id: editingOffer._id, offerData: formData })).unwrap();
        toast.success('Offer updated successfully!');
      } else {
        await dispatch(createNewOffer(formData)).unwrap();
        toast.success('Offer created successfully!');
      }
      setDialogOpen(false);
      resetForm();
      setEditingOffer(null);
      setBannerImage(null);
      setApplicableProducts([]);
      setApplicableCategories([]);
    } catch (error) {
      toast.error(error || 'Failed to save offer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await dispatch(deleteExistingOffer(offerToDelete._id)).unwrap();
      toast.success('Offer deleted successfully!');
      setDeleteDialogOpen(false);
      setOfferToDelete(null);
    } catch (error) {
      toast.error(error || 'Failed to delete offer');
    }
  };

  const getStatusColor = (offer) => {
    const now = new Date();
    const startDate = new Date(offer.startDate);
    const endDate = new Date(offer.endDate);
    
    if (now < startDate) return 'warning';
    if (now > endDate) return 'error';
    return 'success';
  };

  const getStatusText = (offer) => {
    const now = new Date();
    const startDate = new Date(offer.startDate);
    const endDate = new Date(offer.endDate);
    
    if (now < startDate) return 'Upcoming';
    if (now > endDate) return 'Expired';
    return 'Active';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const initialValues = editingOffer ? {
    name: editingOffer.name || '',
    description: editingOffer.description || '',
    discountPercentage: editingOffer.discountPercentage || '',
    startDate: editingOffer.startDate ? editingOffer.startDate.split('T')[0] : '',
    endDate: editingOffer.endDate ? editingOffer.endDate.split('T')[0] : '',
  } : {
    name: '',
    description: '',
    discountPercentage: '',
    startDate: '',
    endDate: '',
  };

  const categories = Array.from(new Set(products.map(p => p.category)));

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading offers...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Offer Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Create and manage promotional offers for your products.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" color="primary">
                    {allOffers.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Offers
                  </Typography>
                </Box>
                <LocalOffer color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" color="success.main">
                    {allOffers.filter(offer => getStatusText(offer) === 'Active').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Offers
                  </Typography>
                </Box>
                <CheckCircle color="success" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" color="warning.main">
                    {allOffers.filter(offer => getStatusText(offer) === 'Upcoming').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Upcoming Offers
                  </Typography>
                </Box>
                <Schedule color="warning" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" color="error.main">
                    {allOffers.filter(offer => getStatusText(offer) === 'Expired').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Expired Offers
                  </Typography>
                </Box>
                <Cancel color="error" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">All Offers</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreateOffer}
        >
          Create New Offer
        </Button>
      </Box>

      {/* Offers Table */}
      <Paper elevation={2}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Discount</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>End Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {allOffers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      No offers found. Create your first offer to get started.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                allOffers.map((offer) => (
                  <TableRow key={offer._id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {offer.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 200 }}>
                        {offer.description}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`${offer.discountPercentage}% OFF`}
                        color="success"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(offer.startDate)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(offer.endDate)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusText(offer)}
                        color={getStatusColor(offer)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Edit Offer">
                        <IconButton
                          size="small"
                          onClick={() => handleEditOffer(offer)}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Offer">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteOffer(offer)}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Create/Edit Offer Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingOffer ? 'Edit Offer' : 'Create New Offer'}
        </DialogTitle>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
            <Form>
              <DialogContent>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      name="name"
                      label="Offer Name"
                      value={values.name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.name && Boolean(errors.name)}
                      helperText={touched.name && errors.name}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      name="description"
                      label="Description"
                      multiline
                      rows={3}
                      value={values.description}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.description && Boolean(errors.description)}
                      helperText={touched.description && errors.description}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      name="discountPercentage"
                      label="Discount Percentage"
                      type="number"
                      value={values.discountPercentage}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.discountPercentage && Boolean(errors.discountPercentage)}
                      helperText={touched.discountPercentage && errors.discountPercentage}
                      InputProps={{
                        endAdornment: <Typography variant="body2">%</Typography>,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      name="startDate"
                      label="Start Date"
                      type="date"
                      value={values.startDate}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.startDate && Boolean(errors.startDate)}
                      helperText={touched.startDate && errors.startDate}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      name="endDate"
                      label="End Date"
                      type="date"
                      value={values.endDate}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.endDate && Boolean(errors.endDate)}
                      helperText={touched.endDate && errors.endDate}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      variant="outlined"
                      component="label"
                      fullWidth
                      sx={{ mb: 1 }}
                    >
                      {bannerImage ? `Selected: ${bannerImage.name}` : 'Upload Banner Image'}
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={e => setBannerImage(e.target.files[0])}
                      />
                    </Button>
                    {(!bannerImage && !editingOffer) && (
                      <Typography variant="caption" color="error">
                        Banner image is required
                      </Typography>
                    )}
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel id="applicable-products-label">Applicable Products</InputLabel>
                      <Select
                        labelId="applicable-products-label"
                        multiple
                        value={applicableProducts}
                        onChange={e => setApplicableProducts(e.target.value)}
                        input={<OutlinedInput label="Applicable Products" />}
                        renderValue={selected =>
                          selected.map(id => {
                            const prod = products.find(p => p._id === id);
                            return prod ? prod.name : id;
                          }).join(', ')
                        }
                      >
                        {products.map(product => (
                          <MenuItem key={product._id} value={product._id}>
                            <Checkbox checked={applicableProducts.indexOf(product._id) > -1} />
                            <ListItemText primary={product.name} />
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel id="applicable-categories-label">Applicable Categories</InputLabel>
                      <Select
                        labelId="applicable-categories-label"
                        multiple
                        value={applicableCategories}
                        onChange={e => setApplicableCategories(e.target.value)}
                        input={<OutlinedInput label="Applicable Categories" />}
                        renderValue={selected => selected.join(', ')}
                      >
                        {categories.map(category => (
                          <MenuItem key={category} value={category}>
                            <Checkbox checked={applicableCategories.indexOf(category) > -1} />
                            <ListItemText primary={category} />
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="contained" disabled={isSubmitting}>
                  {isSubmitting ? <CircularProgress size={20} /> : (editingOffer ? 'Update' : 'Create')}
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the offer "{offerToDelete?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default OfferManagement; 