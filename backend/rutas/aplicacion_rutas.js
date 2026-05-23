const express = require('express');
const aplicacionController = require('../controladores/aplicacion_controller');
const authMiddleware = require('../middleware/auth_middleware');
const router = express.Router();

router.use(authMiddleware); // todas requieren autenticación

router.post('/', aplicacionController.postular);                               // voluntario
router.get('/mis', aplicacionController.misPostulaciones);                     // voluntario
router.get('/publicacion/:publicacion_id', aplicacionController.listarPostulantes); // organización
router.put('/:id/estado', aplicacionController.cambiarEstado);                 // organización
router.put('/:id/horas', aplicacionController.registrarHoras);                 // organización
router.delete('/:id', aplicacionController.eliminarPostulacion);              // voluntario

module.exports = router;