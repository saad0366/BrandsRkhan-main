import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Divider,
  Chip
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  DownloadOutlined, 
  DateRange,
  FilterAlt,
  Refresh
} from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'react-toastify';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const OfferAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exportFormat, setExportFormat] = useState('pdf');
  const [exportLoading, setExportLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async (filters = {}) => {
    setLoading(true);
    try {
      let url = '/api/v1/offers/analytics';
      
      // Add date range filters if provided
      if (filters.startDate && filters.endDate) {
        url += `?startDate=${filters.startDate}&endDate=${filters.endDate}`;
      }
      
      const res = await axios.get(url, { withCredentials: true });
      setAnalytics(res.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load analytics');
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (e) => {
    setDateRange({
      ...dateRange,
      [e.target.name]: e.target.value
    });
  };

  const applyDateFilter = () => {
    if (dateRange.startDate && dateRange.endDate) {
      fetchAnalytics({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      });
    } else {
      toast.warning('Please select both start and end dates');
    }
  };

  const resetFilters = () => {
    setDateRange({
      startDate: '',
      endDate: ''
    });
    fetchAnalytics();
  };

  const handleExportReport = async () => {
    setExportLoading(true);
    try {
      // Create query parameters for date range if provided
      let queryParams = '';
      if (dateRange.startDate && dateRange.endDate) {
        queryParams = `?format=${exportFormat}&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`;
      } else {
        queryParams = `?format=${exportFormat}`;
      }

      const response = await axios.get(`/api/v1/offers/export-report${queryParams}`, {
        responseType: 'blob',
        withCredentials: true
      });
      
      // Create a download link and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Set filename based on format
      const date = new Date().toISOString().split('T')[0];
      link.setAttribute('download', `offer-analytics-${date}.${exportFormat}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success(`Report exported successfully as ${exportFormat.toUpperCase()}`);
    } catch (err) {
      toast.error(`Failed to export report: ${err.message}`);
    } finally {
      setExportLoading(false);
    }
  };

  if (loading) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Loading analytics data...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Offer Analytics & Reporting
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel id="export-format-label">Format</InputLabel>
            <Select
              labelId="export-format-label"
              value={exportFormat}
              label="Format"
              onChange={(e) => setExportFormat(e.target.value)}
              size="small"
            >
              <MenuItem value="pdf">PDF</MenuItem>
              <MenuItem value="excel">Excel</MenuItem>
              <MenuItem value="csv">CSV</MenuItem>
            </Select>
          </FormControl>
          
          <Button
            variant="contained"
            color="primary"
            startIcon={<DownloadOutlined />}
            onClick={handleExportReport}
            disabled={exportLoading}
          >
            {exportLoading ? <CircularProgress size={24} /> : 'Export Report'}
          </Button>
        </Box>
      </Box>

      {/* Date Range Filter */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <DateRange color="primary" />
          <Typography variant="subtitle1">Filter by Date Range</Typography>
          
          <TextField
            label="Start Date"
            type="date"
            name="startDate"
            value={dateRange.startDate}
            onChange={handleDateRangeChange}
            InputLabelProps={{ shrink: true }}
            size="small"
            sx={{ ml: 2 }}
          />
          
          <TextField
            label="End Date"
            type="date"
            name="endDate"
            value={dateRange.endDate}
            onChange={handleDateRangeChange}
            InputLabelProps={{ shrink: true }}
            size="small"
          />
          
          <Button
            variant="outlined"
            startIcon={<FilterAlt />}
            onClick={applyDateFilter}
            size="small"
          >
            Apply Filter
          </Button>
          
          <Button
            variant="text"
            startIcon={<Refresh />}
            onClick={resetFilters}
            size="small"
          >
            Reset
          </Button>
        </Box>
      </Paper>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Total Offers</Typography>
              <Typography variant="h3">{analytics?.summary?.totalOffers || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Active Offers</Typography>
              <Typography variant="h3" color="success.main">{analytics?.summary?.activeOffers || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Total Redemptions</Typography>
              <Typography variant="h3" color="primary.main">{analytics?.summary?.totalRedemptions || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Total Discount</Typography>
              <Typography variant="h3" color="secondary.main">${analytics?.summary?.totalDiscountAmount?.toFixed(2) || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Offer Performance by Redemptions</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={analytics?.topOffersByRedemptions || []}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="redemptions" fill="#8884d8" name="Redemptions" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Offer Types Distribution</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics?.offerTypeDistribution || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {(analytics?.offerTypeDistribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Top Performing Offers Table */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <Typography variant="h6" gutterBottom>Top Performing Offers by Revenue</Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Offer Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Discount</TableCell>
                <TableCell>Redemptions</TableCell>
                <TableCell>Revenue Generated</TableCell>
                <TableCell>ROI</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(analytics?.topOffersByRevenue || []).map((offer) => (
                <TableRow key={offer._id}>
                  <TableCell>{offer.name}</TableCell>
                  <TableCell>
                    <Chip 
                      label={offer.offerType || 'General'} 
                      size="small" 
                      color={offer.offerType === 'Product' ? 'primary' : offer.offerType === 'Category' ? 'secondary' : 'default'}
                    />
                  </TableCell>
                  <TableCell>{offer.discountPercentage}%</TableCell>
                  <TableCell>{offer.redemptions}</TableCell>
                  <TableCell>${offer.revenue?.toFixed(2) || 0}</TableCell>
                  <TableCell>{offer.roi ? `${offer.roi.toFixed(2)}%` : 'N/A'}</TableCell>
                </TableRow>
              ))}
              {(analytics?.topOffersByRevenue || []).length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">No data available</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Category Performance */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <Typography variant="h6" gutterBottom>Category Performance</Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Category</TableCell>
                <TableCell>Offers Count</TableCell>
                <TableCell>Redemptions</TableCell>
                <TableCell>Revenue</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(analytics?.categoryPerformance || []).map((category, index) => (
                <TableRow key={index}>
                  <TableCell>{category.category}</TableCell>
                  <TableCell>{category.offersCount}</TableCell>
                  <TableCell>{category.redemptions}</TableCell>
                  <TableCell>${category.revenue?.toFixed(2) || 0}</TableCell>
                </TableRow>
              ))}
              {(analytics?.categoryPerformance || []).length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">No category data available</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
};

export default OfferAnalytics;