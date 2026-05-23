const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const pool = require('./config/db');
const authRutas = require('./rutas/auth_rutas');
const ubicacionRutas = require('./rutas/ubicacion_rutas');
const voluntarioRutas = require('./rutas/voluntario_rutas');
const insigniaRutas = require('./rutas/insignia_rutas');
const aplicacionRutas = require('./rutas/aplicacion_rutas');
const certificadoRutas = require('./rutas/certificado_rutas');
const adminRutas = require('./rutas/admin_rutas');
const organizacionRutas = require('./rutas/organizacion_rutas');
const publicacionRutas = require('./rutas/publicacion_rutas');
const categoriaRutas = require('./rutas/categoria_rutas');
const notificacionRutas = require('./rutas/notificacion_rutas');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Exponer la carpeta de fotos de perfil públicamente
app.use('/fotodeperfil', express.static(path.join(__dirname, 'fotodeperfil')));

// Rutas
app.use('/api/auth', authRutas);
app.use('/api/ubicacion', ubicacionRutas);
app.use('/api/voluntario', voluntarioRutas);
app.use('/api/insignias', insigniaRutas);
app.use('/api/aplicaciones', aplicacionRutas);
app.use('/api/certificados', certificadoRutas);
app.use('/api/admin', adminRutas);
app.use('/api/organizacion', organizacionRutas);
app.use('/api/publicaciones', publicacionRutas);
app.use('/api/categorias', categoriaRutas);
app.use('/api/notificaciones', notificacionRutas);

// Ruta para obtener el historial de actividades del usuario
app.get('/api/usuario/actividades', (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token no proporcionado' });
    
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) return res.status(403).json({ error: 'Token inválido' });
        try {
            const [rows] = await pool.query('SELECT * FROM actividades_usuario WHERE usuario_id = ? ORDER BY fecha_creacion DESC LIMIT 20', [decoded.id]);
            res.json(rows);
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener actividades' });
        }
    });
});

// Ruta para registrar el cierre de sesión en la barra de actividades
app.post('/api/usuario/logout', (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(200).json({ message: 'Logout sin token' });
    
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (!err && decoded) {
            await pool.query('INSERT INTO actividades_usuario (usuario_id, titulo, descripcion) VALUES (?, ?, ?)', [decoded.id, 'Cierre de sesión', 'Has cerrado sesión en el sistema.']);
        }
        res.status(200).json({ message: 'Logout registrado' });
    });
});

// Ruta de prueba
app.get('/api/health', (req, res) => {
    res.json({ message: 'Backend Voluntario+ funcionando correctamente' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    console.log("Configurando SMTP con:", process.env.EMAIL_USER, "en puerto:", process.env.EMAIL_PORT);
});
