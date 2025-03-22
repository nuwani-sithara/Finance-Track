const express = require('express');
const transactionController = require('../controllers/transactionController');
const authController = require('../controllers/authController');

const router = express.Router();

// Protected routes
router.use(authController.protect);

router.post('/', transactionController.createTransaction);
router.get('/', transactionController.getAllTransactions);
router.put('/:id', transactionController.updateTransaction);
router.delete('/:id', transactionController.deleteTransaction);
router.get('/admin', transactionController.getAllTransactionsAdmin);
router.get('/user/:userId', transactionController.getTransactionsByUser);

module.exports = router;