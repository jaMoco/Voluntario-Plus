const express = require('express');
const router = express.Router();
const categoriaController = require('../controladores/categoria_controller');

router.get('/', categoriaController.listar);

module.exports = router;