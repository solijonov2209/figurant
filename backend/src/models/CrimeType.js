const mongoose = require('mongoose');

const crimeTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Jinoyat turi nomi majburiy'],
    unique: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('CrimeType', crimeTypeSchema);
