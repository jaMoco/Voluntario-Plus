const express = require('express');
const authController = require('../controladores/auth_controller');
const pool = require('../config/db');
const router = express.Router();

router.post('/registro/voluntario', authController.registrarVoluntario);
router.post('/registro/organizacion', authController.registrarOrganizacion);
router.post('/registro/admin', authController.registrarAdmin);
router.post('/login', authController.login);
router.post('/google', authController.googleLogin);
router.post('/facebook', authController.facebookLogin);
router.get('/organizaciones', authController.listarOrganizacionesPublicas);
router.get('/verificar-email', async (req, res) => {
    const { token } = req.query;
    const [rows] = await pool.query('SELECT id FROM usuarios WHERE token_verificacion = ?', [token]);
    if (rows.length === 0) return res.status(400).send('Token inválido');
    await pool.query('UPDATE usuarios SET email_verificado = TRUE, token_verificacion = NULL WHERE id = ?', [rows[0].id]);
    res.send('Email verificado correctamente. Ya puedes iniciar sesión.');
});

router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/olvide-password-alternativo', authController.forgotPasswordAlternative);

module.exports = router;