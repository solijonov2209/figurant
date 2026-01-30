const express = require('express');
const {
  getAllCrimeTypes,
  createCrimeType,
  updateCrimeType,
  deleteCrimeType
} = require('../controllers/crimeTypeController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // Barcha routelar uchun authentication kerak

router
  .route('/')
  .get(getAllCrimeTypes)
  .post(authorize('SUPER_ADMIN'), createCrimeType);

router
  .route('/:id')
  .put(authorize('SUPER_ADMIN'), updateCrimeType)
  .delete(authorize('SUPER_ADMIN'), deleteCrimeType);

module.exports = router;
