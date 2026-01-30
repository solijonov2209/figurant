const mongoose = require('mongoose');

const personSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Ism majburiy'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Familiya majburiy'],
    trim: true
  },
  middleName: {
    type: String,
    required: [true, 'Otasining ismi majburiy'],
    trim: true
  },
  birthDate: {
    type: String,
    required: [true, 'Tug\'ilgan sana majburiy']
  },
  passportSerial: {
    type: String,
    required: [true, 'Pasport seria majburiy'],
    uppercase: true,
    maxlength: 2
  },
  passportNumber: {
    type: String,
    required: [true, 'Pasport raqam majburiy'],
    maxlength: 7
  },
  carInfo: {
    type: String,
    default: ''
  },
  districtId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'District',
    required: true
  },
  districtName: {
    type: String,
    required: true
  },
  mahallaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mahalla',
    required: true
  },
  mahallaName: {
    type: String,
    required: true
  },
  crimeTypeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CrimeType',
    required: true
  },
  crimeTypeName: {
    type: String,
    required: true
  },
  additionalInfo: {
    type: String,
    default: ''
  },
  photoUrl: {
    type: String,
    default: null
  },
  fingerprintUrl: {
    type: String,
    default: null
  },
  inProcess: {
    type: Boolean,
    default: false
  },
  processedAt: {
    type: Date,
    default: null
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  processedByName: {
    type: String,
    default: null
  },
  registeredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  registeredByName: {
    type: String,
    required: true
  },
  registeredByPhone: {
    type: String,
    required: true
  },
  registeredAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for search optimization
personSchema.index({ firstName: 'text', lastName: 'text', middleName: 'text' });
personSchema.index({ passportSerial: 1, passportNumber: 1 });
personSchema.index({ districtId: 1, mahallaId: 1 });
personSchema.index({ inProcess: 1 });

module.exports = mongoose.model('Person', personSchema);
