const express = require('express');
const router = express.Router();
const controller = require('../controllers/asistencia.controller');
const auth = require('../middlewares/auth.middleware');

// POST /api/v1/asistencias
router.post('/', auth, controller.registrar);

module.exports = router;
