const express = require('express');
const router = express.Router();

const { createPaymentMethod, getPaymentMethods, updatePaymentMethod, deletePaymentMethod } = require('../controllers/paymentMethod');

const { authenticateToken, admin } = require('../middlewares/authorization');

router.post('/', authenticateToken, admin, createPaymentMethod );
router.get('/', authenticateToken, getPaymentMethods );
router.put('/update/:id', authenticateToken, admin, updatePaymentMethod );
router.delete('/delete/:id', authenticateToken, admin, deletePaymentMethod );

module.exports = router;