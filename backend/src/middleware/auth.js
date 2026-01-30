const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Foydalanuvchini autentifikatsiya qilish
exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Tizimga kirishga ruxsat yo\'q'
    });
  }

  try {
    // Token ni verify qilish
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Foydalanuvchini topish
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Foydalanuvchi topilmadi'
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token noto\'g\'ri yoki muddati tugagan'
    });
  }
};

// Rolga asoslangan ruxsat
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `${req.user.role} roli uchun ruxsat yo'q`
      });
    }
    next();
  };
};
