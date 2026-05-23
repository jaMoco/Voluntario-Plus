const pool = require('../config/db');

const notificacionController = {
    // Obtener notificaciones del usuario logueado
    listarNotificaciones: async (req, res) => {
        const usuario_id = req.usuario.id;
        try {
            const [rows] = await pool.query(
                'SELECT * FROM notificaciones WHERE usuario_id = ? ORDER BY fecha_creacion DESC LIMIT 50',
                [usuario_id]
            );
            res.json(rows);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al obtener notificaciones' });
        }
    },

    // Obtener el conteo de notificaciones no leídas
    obtenerConteoNoLeidas: async (req, res) => {
        const usuario_id = req.usuario.id;
        try {
            const [rows] = await pool.query(
                'SELECT COUNT(*) as total FROM notificaciones WHERE usuario_id = ? AND leida = FALSE',
                [usuario_id]
            );
            res.json({ total: rows[0].total });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al obtener el conteo de no leídas' });
        }
    },

    // Marcar una notificación como leída
    marcarLeida: async (req, res) => {
        const { id } = req.params;
        const usuario_id = req.usuario.id;
        try {
            await pool.query(
                'UPDATE notificaciones SET leida = TRUE WHERE id = ? AND usuario_id = ?',
                [id, usuario_id]
            );
            res.json({ message: 'Notificación marcada como leída' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al actualizar notificación' });
        }
    },

    // Marcar todas como leídas
    marcarTodasLeidas: async (req, res) => {
        const usuario_id = req.usuario.id;
        await pool.query('UPDATE notificaciones SET leida = TRUE WHERE usuario_id = ?', [usuario_id]);
        res.json({ message: 'Todas las notificaciones marcadas como leídas' });
    }
};

module.exports = notificacionController;