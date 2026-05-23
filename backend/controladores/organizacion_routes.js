const express = require('express');
const router = express.Router();
const publicacionController = require('../controladores/publicacion_controller');
const authMiddleware = require('../middlewares/auth_middleware');

// @route   GET /api/organizacion/perfil
// @desc    Obtener datos del perfil de la organización logueada
// @access  Privado (Organización)
router.get('/perfil', authMiddleware, publicacionController.obtenerPerfil);

module.exports = router;