const express = require('express');
const insigniaController = require('../controladores/insignia_controller');
const authMiddleware = require('../middleware/auth_middleware');
const router = express.Router();

router.get('/', insigniaController.listar); // público
router.get('/disponibles', insigniaController.listar); // público

router.use(authMiddleware);
router.post('/asignar', insigniaController.asignar); // solo organización
router.get('/voluntario/:voluntario_id', insigniaController.listarPorVoluntario); // voluntario o admin

module.exports = router;