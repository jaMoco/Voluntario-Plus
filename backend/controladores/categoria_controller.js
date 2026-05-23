const pool = require('../config/db');

const categoriaController = {
    // Obtener todas las categorías para que el frontend pueda mostrarlas en los filtros del feed
    listar: async (req, res) => {
        try {
            const [rows] = await pool.query('SELECT id, nombre, descripcion FROM categorias ORDER BY nombre ASC');
            res.json(rows);
        } catch (error) {
            console.error('Error al obtener categorías:', error);
            res.status(500).json({ error: 'Error interno del servidor al obtener categorías' });
        }
    }
};

module.exports = categoriaController;