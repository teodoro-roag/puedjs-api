const express = require('express');
const router = express.Router();
const controller = require('../controllers/usuarios.controller');
const auth = require('../middlewares/auth.middleware');

router.post('/', controller.create);
router.get('/', controller.getAll);

router.get('/me', auth, controller.getMe);
router.put('/me', auth, controller.updateMe);
router.get('/me/eventos', auth, controller.getMisEventos);

router.get('/:id/puntos', controller.getPuntos);
router.get('/:id', controller.getById);


module.exports = router;
