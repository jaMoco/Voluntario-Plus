const express = require('express');
const router = express.Router();
const publicacionController = require('../controladores/publicacion_controller');
const authMiddleware = require('../middleware/auth_middleware');
const multer = require('multer');
const path = require('path');

// Configuración de Multer para la subida de imágenes
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../fotodeperfil'));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// @route   GET /api/organizacion/perfil
// @desc    Obtener datos del perfil de la organización logueada
// @access  Privado (Organización)
router.get('/perfil', authMiddleware, publicacionController.obtenerPerfil);
router.put('/perfil', authMiddleware, upload.single('foto'), publicacionController.actualizarPerfil);
router.get('/categorias', authMiddleware, publicacionController.listarCategorias);

module.exports = router;