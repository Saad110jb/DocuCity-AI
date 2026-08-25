const express = require('express');
const router = express.Router();
const { login, register, provisionOfficer, updateUserStatus, getMe, getAllUsers } = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

router.post('/login', login);
router.post('/register', register);
router.post('/provision', provisionOfficer);
router.put('/users/:userId', updateUserStatus);
router.get('/me', verifyToken, getMe);
router.get('/users', getAllUsers);

module.exports = router;
