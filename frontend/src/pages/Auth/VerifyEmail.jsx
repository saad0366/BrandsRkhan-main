import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
} from '@mui/material';
import { verifyEmailAndRegister } from '../../api/authAPI';
import { setUser } from '../../redux/slices/authSlice';
import { toast } from 'react-toastify';

const VerifyEmail = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate('/register');
    }
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otp.trim()) {
      setError('Please enter the verification code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await verifyEmailAndRegister(email, otp);
      
      // Store token and user data
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Update Redux state
      dispatch(setUser(response.data.user));

      // Redirect based on user role
      if (response.data.user.role === 'admin') {
        navigate('/admin', { replace: true });
        toast.success('Welcome to Admin Dashboard!');
      } else {
        navigate('/products', { replace: true });
        toast.success('Account created successfully! Welcome to our store!');
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Verify Your Email
          </Typography>
          <Typography variant="body1" color="text.secondary">
            We've sent a verification code to {email}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Verification Code"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            margin="normal"
            placeholder="Enter 6-digit code"
            inputProps={{ maxLength: 6 }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={isLoading}
            sx={{ mt: 2, mb: 3 }}
          >
            {isLoading ? 'Verifying...' : 'Verify Email'}
          </Button>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Didn't receive the code? Check your spam folder or{' '}
              <Button
                variant="text"
                size="small"
                onClick={() => navigate('/register')}
                sx={{ textTransform: 'none' }}
              >
                try again
              </Button>
            </Typography>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default VerifyEmail;