const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { sendWelcomeEmail, sendEmail } = require('../utils/sendEmail');

// @desc    Send OTP for email verification during signup
// @route   POST /api/v1/auth/send-verification-otp
// @access  Public
exports.sendVerificationOtp = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        error: 'Email already registered'
      });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store registration data temporarily (you might want to use Redis for this)
    // For now, we'll create an unverified user
    const tempUser = await User.create({
      name,
      email,
      password,
      isEmailVerified: false,
      otp: otp.toString(),
      otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    });

    // Send OTP email
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Email Verification</h2>
        <p>Welcome to Brands-R-khan!</p>
        <p>Your verification code is: <strong>${otp}</strong></p>
        <p>This code will expire in 10 minutes.</p>
      </div>
    `;
    
    setImmediate(async () => {
      try {
        await sendEmail(email, 'Email Verification - Brands-R-khan', `Your verification code is: ${otp}`, htmlContent);
        console.log('Verification OTP sent successfully');
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError);
      }
    });

    res.status(200).json({
      success: true,
      message: 'Verification code sent to your email',
      otp: process.env.NODE_ENV === 'development' ? otp : undefined
    });
  } catch (error) {
    console.error('Send verification OTP error:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Verify email and complete registration
// @route   POST /api/v1/auth/verify-email
// @access  Public
exports.verifyEmailAndRegister = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Find unverified user
    const user = await User.findOne({ 
      email, 
      isEmailVerified: false,
      otp, 
      otpExpiresAt: { $gt: Date.now() } 
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired verification code'
      });
    }

    // Verify email
    user.isEmailVerified = true;
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    // Send welcome email
    try {
      await sendWelcomeEmail(user.email, user.name);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
    }

    // Generate token
    const token = user.getSignedJwtToken();

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000
    });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Register user (legacy - for backward compatibility)
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log('Register attempt:', { name, email });

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        error: 'Email already registered'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      isEmailVerified: true // For direct registration
    });

    // Send welcome email
    try {
      await sendWelcomeEmail(user.email, user.name);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
    }

    console.log('User registered successfully:', user._id);

    // Generate token
    const token = user.getSignedJwtToken();

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000
    });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide an email and password'
      });
    }

    // Validate email format
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid email'
      });
    }

    // Check if user exists
    const user = await User.findOne({ email }).select('+password');
    console.log('User found:', user ? 'Yes' : 'No');

    if (!user) {
      console.log('No user found with email:', email);
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    console.log('Password match:', isMatch ? 'Yes' : 'No');

    if (!isMatch) {
      console.log('Password does not match for user:', email);
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Generate token
    const token = user.getSignedJwtToken();
    console.log('Token generated successfully');

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get current user
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Logout user
// @route   POST /api/v1/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    data: {}
  });
};

// @desc    Send OTP for password reset
// @route   POST /api/v1/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    console.log('Forgot password request for:', email);

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    console.log('Generated OTP:', otp, 'for user:', email);
    
    // Save OTP to user (expires in 10 minutes)
    user.otp = otp.toString(); // Ensure it's stored as string
    user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    console.log('OTP saved to database:', { otp: user.otp, expires: user.otpExpiresAt });

    // Send OTP email asynchronously (don't block response)
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Password Reset OTP</h2>
        <p>Your OTP for password reset is: <strong>${otp}</strong></p>
        <p>This OTP will expire in 10 minutes.</p>
      </div>
    `;
    
    // Send email in background
    setImmediate(async () => {
      try {
        await sendEmail(email, 'Password Reset OTP', `Your OTP is: ${otp}`, htmlContent);
        console.log('OTP email sent successfully');
      } catch (emailError) {
        console.error('Failed to send OTP email:', emailError);
      }
    });

    res.status(200).json({
      success: true,
      message: 'OTP generated successfully. Check your email.',
      otp: process.env.NODE_ENV === 'development' ? otp : undefined // Show OTP in development only
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send OTP'
    });
  }
};

// @desc    Verify OTP only
// @route   POST /api/v1/auth/verify-otp
// @access  Public
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    console.log('Verify OTP attempt:', { email, otp: otp ? 'provided' : 'missing' });

    // Validate input
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        error: 'Email and OTP are required'
      });
    }

    // Find user by email first
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found:', email);
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    console.log('User found, checking OTP:', {
      storedOTP: user.otp,
      providedOTP: otp,
      otpExpiry: user.otpExpiresAt,
      currentTime: new Date()
    });

    // Check if OTP exists and is not expired
    if (!user.otp || !user.otpExpiresAt) {
      return res.status(400).json({
        success: false,
        error: 'No OTP found. Please request a new one.'
      });
    }

    // Check if OTP is expired
    if (user.otpExpiresAt < Date.now()) {
      return res.status(400).json({
        success: false,
        error: 'OTP has expired. Please request a new one.'
      });
    }

    // Check if OTP matches (convert both to string and trim)
    if (user.otp.toString().trim() !== otp.toString().trim()) {
      console.log('OTP mismatch:', { stored: user.otp, provided: otp });
      return res.status(400).json({
        success: false,
        error: 'Invalid OTP'
      });
    }

    console.log('OTP verified successfully for:', email);

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully'
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify OTP'
    });
  }
};

// @desc    Reset password with OTP
// @route   POST /api/v1/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    console.log('Reset password attempt:', { email, otp: otp ? 'provided' : 'missing' });

    // Validate input
    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Email, OTP, and new password are required'
      });
    }

    // Find user by email first
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found:', email);
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    console.log('User found, checking OTP:', {
      storedOTP: user.otp,
      providedOTP: otp,
      otpExpiry: user.otpExpiresAt,
      currentTime: new Date()
    });

    // Check if OTP exists and is not expired
    if (!user.otp || !user.otpExpiresAt) {
      return res.status(400).json({
        success: false,
        error: 'No OTP found. Please request a new one.'
      });
    }

    // Check if OTP is expired
    if (user.otpExpiresAt < Date.now()) {
      return res.status(400).json({
        success: false,
        error: 'OTP has expired. Please request a new one.'
      });
    }

    // Check if OTP matches (convert both to string and trim)
    if (user.otp.toString().trim() !== otp.toString().trim()) {
      console.log('OTP mismatch:', { stored: user.otp, provided: otp });
      return res.status(400).json({
        success: false,
        error: 'Invalid OTP'
      });
    }

    // Update password
    user.password = newPassword;
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    console.log('Password reset successfully for:', email);

    res.status(200).json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reset password'
    });
  }
}; 