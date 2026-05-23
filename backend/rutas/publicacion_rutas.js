const express = require('express');
const publicacionController = require('../controladores/publicacion_controller');
const authMiddleware = require('../middleware/auth_middleware');
const router = express.Router();

// Rutas públicas
router.get('/', publicacionController.listarActivas);

// Rutas protegidas (requieren autenticación)
router.use(authMiddleware);
router.get('/mis', publicacionController.listarPorOrganizacion); // organización (Mover arriba de :id)
router.post('/', publicacionController.crear);                 // solo organización
router.get('/:id', publicacionController.obtenerPorId);          // Se mueve debajo para no interferir
router.put('/:id', publicacionController.actualizar);          // organización
router.delete('/:id', publicacionController.eliminar);         // organización o admin

module.exports = router;