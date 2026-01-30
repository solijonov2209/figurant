const District = require('../models/District');
const Mahalla = require('../models/Mahalla');

// @desc    Get all districts
// @route   GET /api/districts
// @access  Private
exports.getAllDistricts = async (req, res, next) => {
  try {
    const districts = await District.find().sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: districts.length,
      data: districts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get mahallas by district
// @route   GET /api/districts/:districtId/mahallas
// @access  Private
exports.getMahallasByDistrict = async (req, res, next) => {
  try {
    const mahallas = await Mahalla.find({ districtId: req.params.districtId }).sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: mahallas.length,
      data: mahallas
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create district
// @route   POST /api/districts
// @access  Private (SUPER_ADMIN only)
exports.createDistrict = async (req, res, next) => {
  try {
    const district = await District.create(req.body);

    res.status(201).json({
      success: true,
      data: district
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create mahalla
// @route   POST /api/districts/:districtId/mahallas
// @access  Private (SUPER_ADMIN only)
exports.createMahalla = async (req, res, next) => {
  try {
    req.body.districtId = req.params.districtId;
    const mahalla = await Mahalla.create(req.body);

    res.status(201).json({
      success: true,
      data: mahalla
    });
  } catch (error) {
    next(error);
  }
};
