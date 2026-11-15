const express = require('express');
const controller = require('../controllers/userController');
const { autenticarToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/login', controller.login);
router.post('/usuarios', controller.cadastrar);
router.get('/usuarios', controller.listar);
router.get('/usuarios/:id', autenticarToken, controller.buscarPorId);
router.put('/usuarios/:id', autenticarToken, controller.atualizar);
router.delete('/usuarios/:id', autenticarToken, controller.excluir);

module.exports = router;
