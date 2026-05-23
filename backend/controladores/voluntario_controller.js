const pool = require('../config/db');

const obtenerPerfil = async (req, res) => {
    const usuarioId = req.usuario.id;
    try {
        // Datos del voluntario
        const [voluntario] = await pool.query(`
            SELECT v.*, u.email 
            FROM voluntarios v 
            JOIN usuarios u ON v.usuario_id = u.id 
            WHERE v.usuario_id = ?
        `, [usuarioId]);
        if (!voluntario.length) return res.status(404).json({ error: 'Perfil no encontrado' });

        // Insignias del voluntario
        const [insignias] = await pool.query(`
            SELECT i.*, vi.fecha_otorgada, o.nombre_oficial as organizacion
            FROM voluntario_insignias vi
            JOIN insignias i ON vi.insignia_id = i.id
            JOIN organizaciones o ON vi.organizacion_id = o.usuario_id
            WHERE vi.voluntario_id = ?
        `, [usuarioId]);

        // Postulaciones con detalles
        const [postulaciones] = await pool.query(`
            SELECT a.*, p.titulo, p.fecha_actividad, o.nombre_oficial as organizacion_nombre,
                   CASE WHEN a.estado = 'completado' THEN a.horas_realizadas ELSE 0 END as horas_realizadas
            FROM aplicaciones a
            JOIN publicaciones p ON a.publicacion_id = p.id
            JOIN organizaciones o ON p.organizacion_id = o.usuario_id
            WHERE a.voluntario_id = ?
            ORDER BY a.fecha_aplicacion DESC
        `, [usuarioId]);

        res.json({
            voluntario: voluntario[0],
            insignias,
            postulaciones
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno' });
    }
};

module.exports = { obtenerPerfil };