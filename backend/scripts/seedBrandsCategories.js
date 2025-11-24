const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Brand = require('../models/Brand');
const Category = require('../models/Category');

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await Brand.deleteMany({});
    await Category.deleteMany({});

    // Seed brands
    const brands = [
      { name: 'Emporio Armani' },
      { name: 'Michael Kors' },
      { name: 'Tommy Hilfiger' },
      { name: 'Hugo Boss' },
      { name: 'Fossil' }
    ];

    // Seed categories
    const categories = [
      { name: "Men's Watches" },
      { name: "Women's Watches" },
      { name: "Branded Pre-owned Watches" },
      { name: "Top Brand Original Quality Watches" },
      { name: "Master Copy Watches" }
    ];

    await Brand.insertMany(brands);
    await Category.insertMany(categories);

    console.log('✅ Brands and categories seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedData();