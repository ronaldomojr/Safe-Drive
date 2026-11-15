const userModel = require('../models/userModel');
const { hashSenha, compararSenha, gerarToken } = require('../services/authService');

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SENHA_FORTE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

function semSenha(usuario) {
  const { senha, ...usuarioPublico } = usuario;
  return usuarioPublico;
}

function dadosInvalidos({ nome, email, senha }, exigirSenha) {
  if (!nome || String(nome).trim().length < 3) return 'Informe um nome com ao menos 3 caracteres.';
  if (!email || !EMAIL_VALIDO.test(email)) return 'Informe um e-mail válido.';
  if (exigirSenha && !senha) return 'Informe uma senha.';
  if (senha && !SENHA_FORTE.test(senha)) {
    return 'A senha deve ter 8 caracteres, maiúscula, minúscula, número e caractere especial.';
  }
  return null;
}

async function login(req, res) {
  const { email, senha } = req.body || {};
  if (!email || !senha) return res.status(400).json({ erro: 'E-mail e senha são obrigatórios.' });

  const usuario = userModel.buscarPorEmail(email);
  if (!usuario || !(await compararSenha(senha, usuario.senha))) {
    return res.status(401).json({ erro: 'E-mail ou senha inválidos.' });
  }

  return res.status(200).json({ token: gerarToken(usuario), usuario: semSenha(usuario) });
}

async function cadastrar(req, res) {
  const { nome, email, senha, perfil } = req.body || {};
  const erro = dadosInvalidos({ nome, email, senha }, true);
  if (erro) return res.status(400).json({ erro });
  if (userModel.buscarPorEmail(email)) return res.status(409).json({ erro: 'Este e-mail já está cadastrado.' });

  const usuario = userModel.criar({
    nome: nome.trim(),
    email: email.trim(),
    senha: await hashSenha(senha),
    perfil: perfil === 'admin' ? 'admin' : 'usuario'
  });
  return res.status(201).json({ usuario: semSenha(usuario) });
}

function listar(_req, res) {
  return res.status(200).json({ usuarios: userModel.listar().map(semSenha) });
}

function buscarPorId(req, res) {
  const usuario = userModel.buscarPorId(req.params.id);
  if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado.' });
  return res.status(200).json({ usuario: semSenha(usuario) });
}

async function atualizar(req, res) {
  const existente = userModel.buscarPorId(req.params.id);
  if (!existente) return res.status(404).json({ erro: 'Usuário não encontrado.' });

  const { nome = existente.nome, email = existente.email, senha, perfil = existente.perfil } = req.body || {};
  const erro = dadosInvalidos({ nome, email, senha }, false);
  if (erro) return res.status(400).json({ erro });

  const outroUsuario = userModel.buscarPorEmail(email);
  if (outroUsuario && outroUsuario.id !== existente.id) {
    return res.status(409).json({ erro: 'Este e-mail já está cadastrado.' });
  }

  const dados = { nome: nome.trim(), email: email.trim(), perfil: perfil === 'admin' ? 'admin' : 'usuario' };
  if (senha) dados.senha = await hashSenha(senha);
  const usuario = userModel.atualizar(req.params.id, dados);
  return res.status(200).json({ usuario: semSenha(usuario) });
}

function excluir(req, res) {
  const usuario = userModel.remover(req.params.id);
  if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado.' });
  return res.status(200).json({ mensagem: 'Usuário removido com sucesso.', usuario: semSenha(usuario) });
}

module.exports = { login, cadastrar, listar, buscarPorId, atualizar, excluir };
