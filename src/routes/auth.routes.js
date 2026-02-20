const express = require('express');
const router = express.Router();
const controller = require('../controllers/auth.controller');
const auth = require('../middlewares/auth.middleware');

router.post('/register', controller.register);
router.post('/login', controller.login);

router.post('/forgot-password', controller.forgotPassword);
router.post('/reset-password', controller.resetPassword);
router.post('/change-password', auth, controller.changePassword);

module.exports = router;
