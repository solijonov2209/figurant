const User = require('../models/User');

// @desc    Get all users/admins
// @route   GET /api/users
// @access  Private (SUPER_ADMIN only)
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .populate('districtId', 'name')
      .populate('mahallaId', 'name')
      .sort({ createdAt: -1 });

    const usersData = users.map(user => ({
      id: user._id,
      login: user.login,
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      role: user.role,
      districtId: user.districtId?._id,
      districtName: user.districtId?.name,
      mahallaId: user.mahallaId?._id,
      mahallaName: user.mahallaId?.name,
      createdAt: user.createdAt
    }));

    res.status(200).json({
      success: true,
      count: usersData.length,
      data: usersData
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create user/admin
// @route   POST /api/users
// @access  Private (SUPER_ADMIN only)
exports.createUser = async (req, res, next) => {
  try {
    const user = await User.create(req.body);

    const userData = {
      id: user._id,
      login: user.login,
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      role: user.role,
      districtId: user.districtId,
      mahallaId: user.mahallaId
    };

    res.status(201).json({
      success: true,
      data: userData
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user/admin
// @route   PUT /api/users/:id
// @access  Private (SUPER_ADMIN only)
exports.updateUser = async (req, res, next) => {
  try {
    // Agar parol o'zgartirilmasa, parolni o'chirish
    if (!req.body.password) {
      delete req.body.password;
    }

    let user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Foydalanuvchi topilmadi'
      });
    }

    // Update user
    user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    const userData = {
      id: user._id,
      login: user.login,
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      role: user.role,
      districtId: user.districtId,
      mahallaId: user.mahallaId
    };

    res.status(200).json({
      success: true,
      data: userData
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user/admin
// @route   DELETE /api/users/:id
// @access  Private (SUPER_ADMIN only)
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Foydalanuvchi topilmadi'
      });
    }

    // O'zini o'chirishni oldini olish
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'O\'z profilingizni o\'chira olmaysiz'
      });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};
