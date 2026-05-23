const pool = require('../config/db');
const { enviarCorreoGenerico } = require('../config/mailer'); // Asumiendo que existe una función genérica

const adminController = {
    // Estadísticas globales
    estadisticas: async (req, res) => {
        try {
            const queries = [
                pool.query('SELECT COUNT(*) as total FROM usuarios'),
                pool.query('SELECT COUNT(*) as total FROM voluntarios'),
                pool.query('SELECT COUNT(*) as total FROM organizaciones'),
                pool.query('SELECT COUNT(*) as total FROM publicaciones WHERE activa = true'),
                pool.query('SELECT COUNT(*) as total FROM aplicaciones'),
                pool.query('SELECT COUNT(*) as total FROM organizaciones WHERE verificada = true'),
                pool.query('SELECT COUNT(*) as total FROM voluntarios WHERE tiene_discapacidad = true'),
                pool.query('SELECT COUNT(*) as total FROM voluntarios WHERE es_estudiante = true')
            ];

            const results = await Promise.all(queries);

            res.json({
                total_usuarios: results[0][0][0].total,
                total_voluntarios: results[1][0][0].total,
                total_organizaciones: results[2][0][0].total,
                total_publicaciones_activas: results[3][0][0].total,
                total_postulaciones: results[4][0][0].total,
                organizaciones_verificadas: results[5][0][0].total,
                voluntarios_con_discapacidad: results[6][0][0].total,
                estudiantes_voluntarios: results[7][0][0].total
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al obtener estadísticas' });
        }
    },

    // Listar todas las organizaciones (con filtros)
    listarOrganizaciones: async (req, res) => {
        const { verificada, activa } = req.query;
        let sql = 'SELECT * FROM organizaciones o JOIN usuarios u ON o.usuario_id = u.id WHERE 1=1';
        const params = [];
        if (verificada !== undefined) {
            sql += ' AND o.verificada = ?';
            params.push(verificada === 'true');
        }
        if (activa !== undefined) {
            sql += ' AND u.activo = ?';
            params.push(activa === 'true');
        }
        try {
            const [rows] = await pool.query(sql, params);
            res.json(rows);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al listar organizaciones' });
        }
    },

    // Aprobar/rechazar verificación de organización
    cambiarVerificacion: async (req, res) => {
        const { id } = req.params; // usuario_id de la organización
        const { verificada } = req.body;
        try {
            await pool.query('UPDATE organizaciones SET verificada = ?, fecha_verificacion = NOW() WHERE usuario_id = ?', [verificada, id]);
            res.json({ message: `Organización ${verificada ? 'verificada' : 'desmarcada como verificada'}` });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al actualizar verificación' });
        }
    },

    // Activar/desactivar usuario (voluntario u organización)
    cambiarEstadoUsuario: async (req, res) => {
        const { id } = req.params;
        const { activo } = req.body;
        try {
            await pool.query('UPDATE usuarios SET activo = ? WHERE id = ?', [activo, id]);
            res.json({ message: `Usuario ${activo ? 'activado' : 'desactivado'} correctamente` });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al cambiar estado' });
        }
    },

    // Listar todos los voluntarios (con filtros por discapacidad, estudiante, etc.)
    listarVoluntarios: async (req, res) => {
        const { discapacidad, estudiante } = req.query;
        let sql = 'SELECT v.*, u.email, u.activo FROM voluntarios v JOIN usuarios u ON v.usuario_id = u.id WHERE 1=1';
        const params = [];
        if (discapacidad !== undefined) {
            sql += ' AND v.tiene_discapacidad = ?';
            params.push(discapacidad === 'true');
        }
        if (estudiante !== undefined) {
            sql += ' AND v.es_estudiante = ?';
            params.push(estudiante === 'true');
        }
        try {
            const [rows] = await pool.query(sql, params);
            res.json(rows);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al listar voluntarios' });
        }
    },

    // Listar todas las publicaciones (para gestión de admin)
    listarPublicacionesAdmin: async (req, res) => {
        try {
            const [rows] = await pool.query(`
                SELECT p.*, o.nombre_oficial as organizacion_nombre 
                FROM publicaciones p 
                JOIN organizaciones o ON p.organizacion_id = o.usuario_id 
                ORDER BY p.created_at DESC
            `);
            res.json(rows);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al listar publicaciones para administración' });
        }
    },

    // Eliminar un usuario permanentemente (Voluntario u Organización)
    eliminarUsuario: async (req, res) => {
        const { id } = req.params;
        try {
            // Al eliminar el usuario, la restricción ON DELETE CASCADE se encarga 
            // de borrar los registros en las tablas voluntarios/organizaciones.
            const [result] = await pool.query('DELETE FROM usuarios WHERE id = ?', [id]);
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }
            res.json({ message: 'Usuario y todos sus datos asociados eliminados correctamente' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al eliminar el usuario' });
        }
    },

    // Eliminar publicación con notificación a la organización
    eliminarPublicacionAdmin: async (req, res) => {
        const { id } = req.params;
        try {
            // 1. Obtener datos de la publicación y el email de la organización antes de borrar
            const [rows] = await pool.query(`
                SELECT p.titulo, o.email_oficial, o.nombre_oficial, o.usuario_id
                FROM publicaciones p
                JOIN organizaciones o ON p.organizacion_id = o.usuario_id
                WHERE p.id = ?`, [id]);

            if (rows.length === 0) return res.status(404).json({ error: 'Publicación no encontrada' });
            const pub = rows[0];

            // 2. Eliminar la publicación
            await pool.query('DELETE FROM publicaciones WHERE id = ?', [id]);

            // 3. Enviar notificación
            const mensaje = `Hola ${pub.nombre_oficial}. Te informamos que tu evento "${pub.titulo}" ha sido eliminado de nuestra plataforma debido a que no cumple con nuestras políticas de comunidad.`;
            await enviarCorreoGenerico(pub.email_oficial, 'Notificación de Seguridad - Evento Eliminado', mensaje);

            // Notificación interna
            await pool.query('INSERT INTO notificaciones (usuario_id, tipo, mensaje) VALUES (?, "sistema", ?)', 
                [pub.usuario_id, `Su publicación "${pub.titulo}" fue eliminada por los administradores ya que no cumple con las políticas.`]);

            res.json({ message: 'Evento eliminado y organización notificada' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al eliminar el evento' });
        }
    },

    // Reporte de asistencia a eventos
    reporteAsistencia: async (req, res) => {
        const { publicacion_id } = req.query;
        if (!publicacion_id) {
            return res.status(400).json({ error: 'Se requiere publicacion_id' });
        }
        try {
            const [rows] = await pool.query(
                `SELECT v.nombre_completo, v.cedula, a.estado, a.horas_realizadas,
                        CASE WHEN a.estado = 'completado' THEN 'Asistió' ELSE 'No asistió' END as asistencia
                FROM aplicaciones a
                JOIN voluntarios v ON a.voluntario_id = v.usuario_id
                WHERE a.publicacion_id = ? AND a.estado IN ('aceptado', 'completado', 'rechazado')`,
                [publicacion_id]
            );
            res.json(rows);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al generar reporte de asistencia' });
        }
    }
};

module.exports = adminController;