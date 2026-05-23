const pool = require('../config/db');
const path = require('path');
// Para generar PDF puedes usar pdfkit o similar (instalar: npm install pdfkit)
// Aquí generamos solo la lógica de datos y la ruta para descargar PDF (quedaría pendiente la generación real del PDF)

const certificadoController = {
    // Generar certificado para una aplicación completada (organización o admin)
    generar: async (req, res) => {
        const { aplicacion_id } = req.body;
        const organizacion_id = req.usuario.id;
        const rol = req.usuario.rol;

        try {
            // Verificar que la aplicación pertenece a una publicación de la organización (o admin)
            let query = `
                SELECT a.*, v.nombre_completo, v.cedula, v.es_estudiante, v.universidad, v.carrera,
                       p.titulo, p.descripcion, p.fecha_actividad, o.nombre_oficial as organizacion_nombre
                FROM aplicaciones a
                JOIN voluntarios v ON a.voluntario_id = v.usuario_id
                JOIN publicaciones p ON a.publicacion_id = p.id
                JOIN organizaciones o ON p.organizacion_id = o.usuario_id
                WHERE a.id = ? AND a.estado = 'completado'
            `;
            const params = [aplicacion_id];
            if (rol !== 'admin') {
                query += ' AND p.organizacion_id = ?';
                params.push(organizacion_id);
            }
            const [rows] = await pool.query(query, params);
            if (rows.length === 0) {
                return res.status(404).json({ error: 'Aplicación completada no encontrada o no autorizada' });
            }
            const data = rows[0];

            // Verificar si ya existe certificado
            const [existe] = await pool.query('SELECT id FROM certificados WHERE aplicacion_id = ?', [aplicacion_id]);
            if (existe.length > 0) {
                return res.status(400).json({ error: 'Este certificado ya fue generado' });
            }

            // Aquí generarías el PDF con la librería pdfkit (por simplicidad, guardamos solo registro)
            // Por ahora guardamos registro sin ruta de PDF real
            const ruta_pdf = `/certificados/${aplicacion_id}.pdf`; // dummy
            await pool.query(
                'INSERT INTO certificados (aplicacion_id, ruta_pdf, horas_certificadas) VALUES (?, ?, ?)',
                [aplicacion_id, ruta_pdf, data.horas_realizadas]
            );
            res.status(201).json({ message: 'Certificado generado exitosamente', ruta: ruta_pdf, data });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al generar certificado' });
        }
    },

    // Listar certificados de un voluntario
    listarPorVoluntario: async (req, res) => {
        const voluntario_id = req.usuario.id; // desde token
        try {
            const [rows] = await pool.query(
                `SELECT c.*, a.horas_realizadas, p.titulo, o.nombre_oficial as organizacion_nombre
                FROM certificados c
                JOIN aplicaciones a ON c.aplicacion_id = a.id
                JOIN publicaciones p ON a.publicacion_id = p.id
                JOIN organizaciones o ON p.organizacion_id = o.usuario_id
                WHERE a.voluntario_id = ?
                ORDER BY c.fecha_emision DESC`,
                [voluntario_id]
            );
            res.json(rows);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al listar certificados' });
        }
    },

    // Descargar el archivo PDF del certificado
    descargar: async (req, res) => {
        const { aplicacionId } = req.params;
        const voluntario_id = req.usuario.id;

        try {
            const [rows] = await pool.query(
                `SELECT c.ruta_pdf FROM certificados c
                 JOIN aplicaciones a ON c.aplicacion_id = a.id
                 WHERE a.id = ? AND a.voluntario_id = ?`,
                [aplicacionId, voluntario_id]
            );

            if (rows.length === 0) {
                return res.status(404).json({ error: 'Certificado no encontrado' });
            }

            const absolutePath = path.resolve(rows[0].ruta_pdf);
            res.download(absolutePath);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al descargar el archivo' });
        }
    }
};

module.exports = certificadoController;