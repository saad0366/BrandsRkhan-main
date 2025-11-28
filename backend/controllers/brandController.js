const Brand = require('../models/Brand');

// Get all brands
exports.getBrands = async (req, res) => {
  try {
    const brands = await Brand.find().sort({ name: 1 });
    res.status(200).json({
      success: true,
      data: brands
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Add new brand
exports.addBrand = async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Brand name is required'
      });
    }

    const brand = await Brand.create({ name: name.trim() });
    
    res.status(201).json({
      success: true,
      data: brand,
      message: 'Brand added successfully'
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Brand already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete brand
exports.deleteBrand = async (req, res) => {
  try {
    const brand = await Brand.findByIdAndDelete(req.params.id);

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Brand deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};