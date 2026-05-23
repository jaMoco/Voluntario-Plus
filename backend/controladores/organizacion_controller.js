const pool = require('../config/db');
const { generarCertificado } = require('../utilidades/pdf_generator');

const completarProyecto = async (req, res) => {
    const { aplicacionId } = req.params;
    const { horas_realizadas } = req.body;
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        // Actualizar aplicación
        await connection.query('UPDATE aplicaciones SET estado = "completado", horas_realizadas = ? WHERE id = ?', [horas_realizadas, aplicacionId]);
        // Obtener datos para el certificado
        const [aplicacion] = await connection.query(`
            SELECT a.*, v.nombre_completo, p.titulo, o.nombre_oficial
            FROM aplicaciones a
            JOIN voluntarios v ON a.voluntario_id = v.usuario_id
            JOIN publicaciones p ON a.publicacion_id = p.id
            JOIN organizaciones o ON p.organizacion_id = o.usuario_id
            WHERE a.id = ?
        `, [aplicacionId]);
        
        if (!aplicacion.length) {
            throw new Error('Aplicación no encontrada para generar certificado');
        }

        const datos = aplicacion[0];
        const rutaPDF = await generarCertificado(datos.nombre_completo, horas_realizadas, datos.titulo, datos.nombre_oficial);
        // Guardar ruta en certificados
        await connection.query('INSERT INTO certificados (aplicacion_id, ruta_pdf, horas_certificadas) VALUES (?, ?, ?)', [aplicacionId, rutaPDF, horas_realizadas]);
        await connection.commit();
        res.json({ message: 'Proyecto completado', pdf: rutaPDF });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ error: 'Error al completar proyecto' });
    } finally {
        connection.release();
    }
};

module.exports = { completarProyecto };