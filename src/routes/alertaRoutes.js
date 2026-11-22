const express = require('express');
const controller = require('../controllers/alertaController');
const { autenticarToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.param('id', (req, res, next, id) => {
  if (!/^[0-9]+$/.test(id) || Number(id) > 2147483647) return res.sendStatus(404);
  next();
});
const social = require('../controllers/interacaoController');
router.get('/minhas-curtidas', autenticarToken, social.minhas);
router.put('/posts/:id/curtida', autenticarToken, social.curtir);
router.delete('/posts/:id/curtida', autenticarToken, social.descurtir);
router.get('/posts/:id/comentarios', social.listar);
router.post('/posts/:id/comentarios', autenticarToken, social.comentar);

router.get('/posts/:id/foto', controller.foto);
router.get(['/alertas', '/posts'], controller.listar);
router.post(['/alertas', '/posts'], autenticarToken, controller.criar);
router.delete(['/alertas/:id', '/posts/:id'], autenticarToken, controller.excluir);

module.exports = router;
