const VENEZUELA_DATA = require('../../frontend/src/data/venezuela.json');

const obtenerPaises = async (req, res) => {
    res.json(['Venezuela']);
};

const obtenerEstados = async (req, res) => {
    try {
        const estados = Object.keys(VENEZUELA_DATA).sort();
        res.json(estados);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener estados' });
    }
};

const obtenerMunicipios = async (req, res) => {
    const { estado } = req.query;
    try {
        if (!estado || !VENEZUELA_DATA[estado]) {
            return res.json([]);
        }
        res.json(VENEZUELA_DATA[estado]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener municipios' });
    }
};

module.exports = { obtenerPaises, obtenerEstados, obtenerMunicipios };