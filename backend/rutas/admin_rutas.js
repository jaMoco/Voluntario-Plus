const express = require('express');
const router = express.Router();
const adminController = require('../controladores/admin_controller');
const verificarToken = require('../middleware/auth_middleware');
const { esAdmin } = require('../middleware/rol_middleware'); // Middleware para verificar rol

router.use(verificarToken, esAdmin); // Todas las rutas de admin requieren token y rol admin

router.get('/estadisticas', adminController.estadisticas);
router.get('/organizaciones', adminController.listarOrganizaciones);
router.get('/voluntarios', adminController.listarVoluntarios);

router.put('/usuarios/:id/estado', adminController.cambiarEstadoUsuario);
router.delete('/usuarios/:id', adminController.eliminarUsuario);

router.put('/organizaciones/:id/verificacion', adminController.cambiarVerificacion);

router.get('/publicaciones', adminController.listarPublicacionesAdmin);
router.delete('/publicaciones/:id', adminController.eliminarPublicacionAdmin);
router.get('/reportes/asistencia', adminController.reporteAsistencia);

module.exports = router;