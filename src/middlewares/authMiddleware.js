const { validarToken } = require('../services/authService');

function autenticarToken(req, res, next) {
  const autorizacao = req.headers.authorization;
  if (!autorizacao || !autorizacao.startsWith('Bearer ')) {
    return res.status(401).json({ erro: 'Token de autenticação não informado.' });
  }

  const token = autorizacao.slice(7);
  try {
    req.usuario = validarToken(token);
    return next();
  } catch {
    return res.status(403).json({ erro: 'Token inválido ou expirado.' });
  }
}

function autorizarAdmin(req, res, next) {
  if (req.usuario?.perfil !== 'admin') {
    return res.status(403).json({ erro: 'Acesso restrito a administradores.' });
  }
  return next();
}

module.exports = { autenticarToken, autorizarAdmin };
