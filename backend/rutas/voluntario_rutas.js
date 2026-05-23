const express = require('express');
const { obtenerPerfil } = require('../controladores/voluntario_controller');
const authController = require('../controladores/auth_controller');
const verificarToken = require('../middleware/auth_middleware');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Configuración de Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../fotodeperfil'));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

router.get('/perfil', verificarToken, obtenerPerfil);
router.put('/perfil', verificarToken, upload.single('foto'), authController.actualizarPerfilVoluntario);
// otras rutas...

module.exports = router;
