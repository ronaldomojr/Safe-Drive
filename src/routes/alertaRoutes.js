const express = require('express');
const controller = require('../controllers/alertaController');
const { autenticarToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/alertas', controller.listar);
router.post('/alertas', autenticarToken, controller.criar);
router.delete('/alertas/:id', autenticarToken, controller.excluir);

module.exports = router;
