const express = require('express');
const router = express.Router();
const controller = require('../controllers/eventos.controller');
const auth = require('../middlewares/auth.middleware');
const registroController = require('../controllers/registro.controller');

router.post('/', controller.create);
router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/:id/registro', auth, registroController.registrar);

module.exports = router;
