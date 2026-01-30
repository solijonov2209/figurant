const express = require('express');
const {
  getAllDistricts,
  getMahallasByDistrict,
  createDistrict,
  createMahalla
} = require('../controllers/districtController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // Barcha routelar uchun authentication kerak

router
  .route('/')
  .get(getAllDistricts)
  .post(authorize('SUPER_ADMIN'), createDistrict);

router
  .route('/:districtId/mahallas')
  .get(getMahallasByDistrict)
  .post(authorize('SUPER_ADMIN'), createMahalla);

module.exports = router;
