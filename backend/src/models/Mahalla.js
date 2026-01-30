const mongoose = require('mongoose');

const mahallaSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Mahalla nomi majburiy'],
    trim: true
  },
  districtId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'District',
    required: [true, 'Tuman majburiy']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Bir tumanda bir xil nomli mahalla bo'lmasligi uchun
mahallaSchema.index({ name: 1, districtId: 1 }, { unique: true });

module.exports = mongoose.model('Mahalla', mahallaSchema);
