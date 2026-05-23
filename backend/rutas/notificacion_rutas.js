const express = require('express');
const router = express.Router();
const notificacionController = require('../controladores/notificacion_controller');
const verificarToken = require('../middleware/auth_middleware'); 

router.get('/', verificarToken, notificacionController.listarNotificaciones);
router.get('/conteo', verificarToken, notificacionController.obtenerConteoNoLeidas);
router.put('/:id/leida', verificarToken, notificacionController.marcarLeida);
router.put('/leer-todas', verificarToken, notificacionController.marcarTodasLeidas);

module.exports = router;