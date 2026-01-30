const express = require('express');
const {
  createPerson,
  getAllPersons,
  getPersonsInProcess,
  getPerson,
  searchPersons,
  addToProcess,
  removeFromProcess,
  deletePerson
} = require('../controllers/personController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // Barcha routelar uchun authentication kerak

router
  .route('/')
  .get(getAllPersons)
  .post(createPerson);

router.get('/in-process', getPersonsInProcess);
router.get('/search', searchPersons);

router
  .route('/:id')
  .get(getPerson)
  .delete(authorize('SUPER_ADMIN'), deletePerson);

router.put('/:id/add-to-process', authorize('SUPER_ADMIN', 'JQB_ADMIN'), addToProcess);
router.put('/:id/remove-from-process', authorize('SUPER_ADMIN'), removeFromProcess);

module.exports = router;
