const usuarios = [
  {
    id: 1,
    nome: 'Administrador Safe Drive',
    email: 'admin@safedrive.com',
    perfil: 'admin',
    // Senha inicial: Admin@123 (hash bcrypt com 10 salt rounds).
    senha: '$2b$10$ZhpcMe3k3lPGA0o4xbUe7.3oNpVgtJHoSEyi4IgGiT57q..X4p1xy'
  }
];

let proximoId = 2;

function listar() {
  return usuarios.map((usuario) => ({ ...usuario }));
}

function buscarPorId(id) {
  const usuario = usuarios.find((item) => item.id === Number(id));
  return usuario ? { ...usuario } : null;
}

function buscarPorEmail(email) {
  const usuario = usuarios.find((item) => item.email.toLowerCase() === String(email).toLowerCase());
  return usuario ? { ...usuario } : null;
}

function criar({ nome, email, senha, perfil = 'usuario' }) {
  const usuario = { id: proximoId++, nome, email: email.toLowerCase(), senha, perfil };
  usuarios.push(usuario);
  return { ...usuario };
}

function atualizar(id, dados) {
  const indice = usuarios.findIndex((item) => item.id === Number(id));
  if (indice === -1) return null;

  usuarios[indice] = { ...usuarios[indice], ...dados, id: usuarios[indice].id };
  return { ...usuarios[indice] };
}

function remover(id) {
  const indice = usuarios.findIndex((item) => item.id === Number(id));
  if (indice === -1) return null;
  return { ...usuarios.splice(indice, 1)[0] };
}

module.exports = { listar, buscarPorId, buscarPorEmail, criar, atualizar, remover };
