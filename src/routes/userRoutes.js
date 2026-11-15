const express = require('express');
const controller = require('../controllers/userController');
const { autenticarToken, autorizarAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/login', controller.login);
router.post('/usuarios', controller.cadastrar);
router.get('/usuarios', autenticarToken, autorizarAdmin, controller.listar);
router.get('/usuarios/:id', autenticarToken, controller.buscarPorId);
router.put('/usuarios/:id', autenticarToken, autorizarAdmin, controller.atualizar);
router.delete('/usuarios/:id', autenticarToken, autorizarAdmin, controller.excluir);

module.exports = router;
