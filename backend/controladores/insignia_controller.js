const pool = require('../config/db');

const insigniaController = {
    // Listar todas las insignias disponibles
    listar: async (req, res) => {
        try {
            const [rows] = await pool.query('SELECT * FROM insignias ORDER BY id');
            res.json(rows);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al listar insignias' });
        }
    },

    // Asignar insignia a un voluntario (solo organización)
    asignar: async (req, res) => {
        const { voluntario_id, insignia_id } = req.body;
        const organizacion_id = req.usuario.id;

        if (!voluntario_id || !insignia_id) {
            return res.status(400).json({ error: 'Faltan datos' });
        }

        try {
            // Verificar que el voluntario existe
            const [vol] = await pool.query('SELECT usuario_id FROM voluntarios WHERE usuario_id = ?', [voluntario_id]);
            if (vol.length === 0) {
                return res.status(404).json({ error: 'Voluntario no encontrado' });
            }
            // Verificar que la insignia existe
            const [ins] = await pool.query('SELECT id FROM insignias WHERE id = ?', [insignia_id]);
            if (ins.length === 0) {
                return res.status(404).json({ error: 'Insignia no encontrada' });
            }
            // Verificar si ya fue asignada
            const [existe] = await pool.query('SELECT id FROM voluntario_insignias WHERE voluntario_id = ? AND insignia_id = ? AND organizacion_id = ?', [voluntario_id, insignia_id, organizacion_id]);
            if (existe.length > 0) {
                return res.status(400).json({ error: 'Esta insignia ya fue asignada a este voluntario por esta organización' });
            }
            await pool.query(
                'INSERT INTO voluntario_insignias (voluntario_id, insignia_id, organizacion_id) VALUES (?, ?, ?)',
                [voluntario_id, insignia_id, organizacion_id]
            );

            // Notificar al voluntario sobre la nueva insignia
            await pool.query(
                'INSERT INTO notificaciones (usuario_id, tipo, mensaje) VALUES (?, ?, ?)',
                [voluntario_id, 'insignia', `¡Enhorabuena! Has recibido la insignia: ${ins[0].nombre}`]
            );

            res.status(201).json({ message: 'Insignia asignada exitosamente' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al asignar insignia' });
        }
    },

    // Listar insignias de un voluntario
    listarPorVoluntario: async (req, res) => {
        const { voluntario_id } = req.params;
        try {
            const [rows] = await pool.query(
                `SELECT vi.*, i.nombre, i.descripcion, i.imagen_url, o.nombre_oficial as organizacion_nombre
                FROM voluntario_insignias vi
                JOIN insignias i ON vi.insignia_id = i.id
                JOIN organizaciones o ON vi.organizacion_id = o.usuario_id
                WHERE vi.voluntario_id = ?
                ORDER BY vi.fecha_otorgada DESC`,
                [voluntario_id]
            );
            res.json(rows);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al listar insignias' });
        }
    }
};

module.exports = insigniaController;