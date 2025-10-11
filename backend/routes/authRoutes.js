const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  logout,
  forgotPassword,
  resetPassword,
  verifyOtp,
  sendVerificationOtp,
  verifyEmailAndRegister
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/send-verification-otp', sendVerificationOtp);
router.post('/verify-email', verifyEmailAndRegister);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);

module.exports = router; 