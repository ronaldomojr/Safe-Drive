const express = require('express');
const controller = require('../controllers/userController');
const { autenticarToken, autorizarAdmin } = require('../middlewares/authMiddleware');

const perfil = require('../controllers/perfilController');

const router = express.Router();

router.get('/perfil/resumo', autenticarToken, perfil.resumo);
router.get('/perfil', autenticarToken, perfil.proprio);
router.put('/perfil', autenticarToken, perfil.salvar);
router.get('/perfis/:perfilId', perfil.publico);
router.get('/perfis/:perfilId/foto', perfil.avatar);
router.param('perfilId', (_req, res, next, id) => {
  if (!/^[1-9][0-9]*$/.test(id) || Number(id) > 2147483647) return res.sendStatus(404);
  next();
});

router.post('/login', controller.login);
router.post('/usuarios', (req, res, next) => {
  if (req.body?.perfil !== 'admin') return next();
  return autenticarToken(req, res, () => autorizarAdmin(req, res, next));
}, controller.cadastrar);
router.get('/usuarios', autenticarToken, autorizarAdmin, controller.listar);
router.get('/usuarios/:id', autenticarToken, controller.buscarPorId);
router.put('/usuarios/:id', autenticarToken, autorizarAdmin, controller.atualizar);
router.delete('/usuarios/:id', autenticarToken, autorizarAdmin, controller.excluir);

module.exports = router;
