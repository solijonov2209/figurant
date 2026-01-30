const mongoose = require('mongoose');

const districtSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tuman nomi majburiy'],
    unique: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('District', districtSchema);
