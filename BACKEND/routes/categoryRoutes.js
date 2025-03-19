const express = require('express');
const categoryController = require('../controllers/categoryController');
const authController = require('../controllers/authController');

const router = express.Router();

// Remove admin restriction for fetching categories
router.use(authController.protect);

// Allow all authenticated users to fetch categories
router.get('/', categoryController.getAllCategories);

// Restrict other category actions to admins
router.use(authController.restrictTo('admin'));

router.post('/', categoryController.addCategory);
router.put('/:id', categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);


module.exports = router;