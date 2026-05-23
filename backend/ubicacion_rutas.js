const express = require('express');
const router = express.Router();
const { obtenerPaises, obtenerEstados, obtenerMunicipios } = require('../controladores/ubicacion_controller');

// Definir los endpoints que el frontend está llamando
router.get('/paises', obtenerPaises);
router.get('/estados', obtenerEstados);
router.get('/municipios', obtenerMunicipios);

module.exports = router;