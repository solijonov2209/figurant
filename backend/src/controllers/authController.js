const jwt = require('jsonwebtoken');
const User = require('../models/User');

// JWT token yaratish
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// @desc    Login
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { login, password } = req.body;

    // Validatsiya
    if (!login || !password) {
      return res.status(400).json({
        success: false,
        message: 'Login va parol majburiy'
      });
    }

    // Foydalanuvchini topish (parol bilan)
    const user = await User.findOne({ login })
      .select('+password')
      .populate('districtId', 'name')
      .populate('mahallaId', 'name');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Login yoki parol noto\'g\'ri'
      });
    }

    // Parolni tekshirish
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Login yoki parol noto\'g\'ri'
      });
    }

    // Token yaratish
    const token = generateToken(user._id);

    // User ma'lumotini qaytarish (parolsiz)
    const userData = {
      id: user._id,
      login: user.login,
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      role: user.role,
      districtId: user.districtId?._id,
      districtName: user.districtId?.name,
      mahallaId: user.mahallaId?._id,
      mahallaName: user.mahallaId?.name
    };

    res.status(200).json({
      success: true,
      token,
      data: userData
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('districtId', 'name')
      .populate('mahallaId', 'name');

    const userData = {
      id: user._id,
      login: user.login,
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      role: user.role,
      districtId: user.districtId?._id,
      districtName: user.districtId?.name,
      mahallaId: user.mahallaId?._id,
      mahallaName: user.mahallaId?.name
    };

    res.status(200).json({
      success: true,
      data: userData
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
exports.updatePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('+password');

    // Eski parolni tekshirish
    if (!(await user.matchPassword(req.body.currentPassword))) {
      return res.status(401).json({
        success: false,
        message: 'Eski parol noto\'g\'ri'
      });
    }

    user.password = req.body.newPassword;
    await user.save();

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token
    });
  } catch (error) {
    next(error);
  }
};
