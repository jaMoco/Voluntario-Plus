const express = require('express');
const certificadoController = require('../controladores/certificado_controller');
const authMiddleware = require('../middleware/auth_middleware');
const router = express.Router();

router.use(authMiddleware);
router.post('/generar', certificadoController.generar);      // organización o admin
router.get('/mis', certificadoController.listarPorVoluntario); // voluntario
router.get('/descargar/:aplicacionId', certificadoController.descargar); // voluntario

module.exports = router;