const CrimeType = require('../models/CrimeType');

// @desc    Get all crime types
// @route   GET /api/crime-types
// @access  Private
exports.getAllCrimeTypes = async (req, res, next) => {
  try {
    const crimeTypes = await CrimeType.find().sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: crimeTypes.length,
      data: crimeTypes
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create crime type
// @route   POST /api/crime-types
// @access  Private (SUPER_ADMIN only)
exports.createCrimeType = async (req, res, next) => {
  try {
    const crimeType = await CrimeType.create(req.body);

    res.status(201).json({
      success: true,
      data: crimeType
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update crime type
// @route   PUT /api/crime-types/:id
// @access  Private (SUPER_ADMIN only)
exports.updateCrimeType = async (req, res, next) => {
  try {
    const crimeType = await CrimeType.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!crimeType) {
      return res.status(404).json({
        success: false,
        message: 'Jinoyat turi topilmadi'
      });
    }

    res.status(200).json({
      success: true,
      data: crimeType
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete crime type
// @route   DELETE /api/crime-types/:id
// @access  Private (SUPER_ADMIN only)
exports.deleteCrimeType = async (req, res, next) => {
  try {
    const crimeType = await CrimeType.findById(req.params.id);

    if (!crimeType) {
      return res.status(404).json({
        success: false,
        message: 'Jinoyat turi topilmadi'
      });
    }

    await crimeType.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};
