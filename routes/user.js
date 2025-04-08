const express = require('express');
const router = express.Router();

const { getUsers, getUserById, updateUserProfile, deleteUserAccount } = require('../controllers/user');

const { authenticateToken, admin } = require('../middlewares/authorization');
const upload = require('../upload');

router.get('/', authenticateToken, getUsers);
router.get('/:id', authenticateToken, getUserById);
router.put('/update/:id', authenticateToken, upload.single("profilePicture"), updateUserProfile);
router.delete('/delete/:id', authenticateToken, admin, deleteUserAccount);

module.exports = router;