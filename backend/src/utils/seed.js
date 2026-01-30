const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const District = require('../models/District');
const Mahalla = require('../models/Mahalla');
const CrimeType = require('../models/CrimeType');

// Load env vars
dotenv.config();

// Connect to DB
mongoose.connect(process.env.MONGODB_URI);

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await District.deleteMany();
    await Mahalla.deleteMany();
    await CrimeType.deleteMany();

    console.log('Ma\'lumotlar tozalandi...');

    // Create Super Admin
    const superAdmin = await User.create({
      login: 'admin',
      password: 'admin123',
      fullName: 'Super Administrator',
      phoneNumber: '+998901234567',
      role: 'SUPER_ADMIN'
    });

    console.log('Super Admin yaratildi');

    // Create Districts (Namangan viloyati tumanlari)
    const districtsData = [
      { name: 'Namangan shahar', code: 'NMG_CITY' },
      { name: 'Chortoq tumani', code: 'CHORTOQ' },
      { name: 'Chust tumani', code: 'CHUST' },
      { name: 'Kosonsoy tumani', code: 'KOSONSOY' },
      { name: 'Mingbuloq tumani', code: 'MINGBULOQ' },
      { name: 'Namangan tumani', code: 'NAMANGAN' },
      { name: 'Norin tumani', code: 'NORIN' },
      { name: 'Pop tumani', code: 'POP' },
      { name: 'To\'raqo\'rg\'on tumani', code: 'TORAQORGON' },
      { name: 'Uchqo\'rg\'on tumani', code: 'UCHQORGON' },
      { name: 'Uychi tumani', code: 'UYCHI' },
      { name: 'Yangiqo\'rg\'on tumani', code: 'YANGIQORGON' }
    ];

    const districts = await District.insertMany(districtsData);
    console.log('Tumanlar yaratildi');

    // Create Mahallas for Namangan shahar
    const namanganCity = districts.find(d => d.code === 'NMG_CITY');
    const mahallasData = [
      { name: 'Bobur MFY', districtId: namanganCity._id },
      { name: 'Istiqlol MFY', districtId: namanganCity._id },
      { name: 'Mustaqillik MFY', districtId: namanganCity._id },
      { name: 'Navbahor MFY', districtId: namanganCity._id },
      { name: 'Paxtakor MFY', districtId: namanganCity._id }
    ];

    await Mahalla.insertMany(mahallasData);
    console.log('Mahallalar yaratildi');

    // Create Crime Types
    const crimeTypesData = [
      { name: 'O\'g\'irlik', description: 'Mol-mulkni o\'g\'irlash' },
      { name: 'Talonchilik', description: 'Zo\'ravonlik bilan talon-taroj qilish' },
      { name: 'Firibgarlik', description: 'Aldash yo\'li bilan mol-mulk olish' },
      { name: 'Narkotik moddalar', description: 'Giyohvandlik bilan bog\'liq jinoyatlar' },
      { name: 'Ommaviy tartibni buzish', description: 'Jamoat tartibini buzish' },
      { name: 'Qasddan shikastlash', description: 'Boshqa shaxsga qasddan zarar yetkazish' },
      { name: 'Haydovchilik qoidalarini buzish', description: 'Yo\'l harakati qoidalarini buzish' },
      { name: 'Boshqa jinoyatlar', description: 'Boshqa turdagi jinoyat faoliyati' }
    ];

    await CrimeType.insertMany(crimeTypesData);
    console.log('Jinoyat turlari yaratildi');

    // Create sample JQB Admin
    await User.create({
      login: 'jqb_namangan',
      password: 'jqb123',
      fullName: 'JQB Namangan shahar',
      phoneNumber: '+998901234568',
      role: 'JQB_ADMIN',
      districtId: namanganCity._id
    });

    console.log('JQB Admin yaratildi');

    console.log('\n✅ Barcha dastlabki ma\'lumotlar muvaffaqiyatli yuklandi!');
    console.log('\nLogin ma\'lumotlari:');
    console.log('Super Admin - login: admin, password: admin123');
    console.log('JQB Admin - login: jqb_namangan, password: jqb123');

    process.exit(0);
  } catch (error) {
    console.error('Xatolik:', error);
    process.exit(1);
  }
};

seedData();
