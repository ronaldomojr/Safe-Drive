const usuarios = require('../models/userModel');
const { listarAlertas } = require('../models/alertaModel');
const { lerJPEG } = require('../services/foto');

async function mostrar(id, res, editavel) {
  const perfil = await usuarios.perfilSocial(id);
  if (!perfil) return res.status(404).json({ erro: 'Perfil não encontrado.' });
  const posts = await listarAlertas('', id);
  return res.json({ perfil, posts, editavel });
}

function proprio(req, res) { return mostrar(req.usuario.id, res, true); }
function publico(req, res) { return mostrar(req.params.perfilId, res, false); }

async function salvar(req, res) {
  const { bio, foto } = req.body || {};
  if (typeof bio !== 'string' || bio.length > 300) {
    return res.status(400).json({ erro: 'A bio pode ter até 300 caracteres.' });
  }
  let imagem;
  try { imagem = lerJPEG(foto); }
  catch (erro) { return res.status(400).json({ erro: erro.message }); }
  const perfil = await usuarios.salvarPerfil(req.usuario.id, bio.trim(), foto !== undefined, imagem);
  if (!perfil) return res.status(404).json({ erro: 'Perfil não encontrado.' });
  return res.json({ perfil });
}

async function resumo(req, res) {
  const perfil = await usuarios.perfilSocial(req.usuario.id);
  if (!perfil) return res.sendStatus(404);
  return res.set('Cache-Control', 'no-store').json(perfil);
}

async function avatar(req, res) {
  const imagem = await usuarios.buscarAvatar(req.params.perfilId);
  if (!imagem) return res.sendStatus(404);
  return res.set({ 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff' })
    .type('image/jpeg').send(imagem);
}

module.exports = { proprio, publico, salvar, avatar, resumo };
