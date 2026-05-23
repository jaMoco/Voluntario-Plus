const pool = require('../config/db');

const usuarioModelo = {
    // Crear usuario (voluntario u organización)
    crear: async (datos) => {
        const { nombre, email, password_hash, rol, ...extra } = datos;
        const [resultado] = await pool.query(
            `INSERT INTO usuarios (nombre, email, password, rol, ubicacion, descripcion, activo)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [nombre, email, password_hash, rol, extra.ubicacion || null, extra.descripcion || null, true]
        );
        return resultado.insertId;
    },

    // Buscar por email
    buscarPorEmail: async (email) => {
        const [rows] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
        return rows[0];
    },

    // Obtener perfil completo por ID (según rol, podrías traer datos de tablas específicas)
    obtenerPorId: async (id) => {
        const [rows] = await pool.query('SELECT id, nombre, email, rol, ubicacion, descripcion, activo, fecha_registro FROM usuarios WHERE id = ?', [id]);
        return rows[0];
    }
};

module.exports = usuarioModelo;