const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'safe-drive-chave-desenvolvimento';

function hashSenha(senha) {
  return bcrypt.hash(senha, SALT_ROUNDS);
}

function compararSenha(senha, senhaHash) {
  return bcrypt.compare(senha, senhaHash);
}

function gerarToken(usuario) {
  return jwt.sign(
    { id: usuario.id, email: usuario.email, perfil: usuario.perfil },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
}

function validarToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

module.exports = { SALT_ROUNDS, hashSenha, compararSenha, gerarToken, validarToken };
