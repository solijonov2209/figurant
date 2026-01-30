const express = require('express');
const {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect, authorize('SUPER_ADMIN')); // Faqat SUPER_ADMIN

router
  .route('/')
  .get(getAllUsers)
  .post(createUser);

router
  .route('/:id')
  .put(updateUser)
  .delete(deleteUser);

module.exports = router;
