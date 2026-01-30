const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  login: {
    type: String,
    required: [true, 'Login majburiy'],
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Parol majburiy'],
    minlength: [6, 'Parol kamida 6 belgidan iborat bo\'lishi kerak'],
    select: false
  },
  fullName: {
    type: String,
    required: [true, 'To\'liq ism majburiy']
  },
  phoneNumber: {
    type: String,
    required: [true, 'Telefon raqami majburiy']
  },
  role: {
    type: String,
    enum: ['SUPER_ADMIN', 'JQB_ADMIN', 'MAHALLA_INSPECTOR'],
    required: [true, 'Rol majburiy']
  },
  districtId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'District',
    required: function() {
      return this.role === 'JQB_ADMIN' || this.role === 'MAHALLA_INSPECTOR';
    }
  },
  mahallaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mahalla',
    required: function() {
      return this.role === 'MAHALLA_INSPECTOR';
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Parolni hash qilish (save dan oldin)
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Parolni tekshirish metodi
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
