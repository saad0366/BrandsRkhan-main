const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const adminExists = await User.findOne({ email: 'brandrkhanofficial@gmail.com' });
    if (adminExists) {
      console.log('Admin already exists');
      return;
    }

    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const admin = await User.create({
      name: 'BrandsRkhan Admin',
      email: 'brandrkhanofficial@gmail.com',
      password: hashedPassword,
      role: 'admin'
    });

    console.log('Admin created successfully!');
    console.log('Email: brandrkhanofficial@gmail.com');
    console.log('Password: admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();