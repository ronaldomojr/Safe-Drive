const { pool, initDatabase } = require('../config/database');

const CAMPOS_PUBLICOS = 'id, nome, email, perfil, criado_em';

async function listar() {
  await initDatabase();
  const resultado = await pool.query(`SELECT ${CAMPOS_PUBLICOS} FROM usuarios ORDER BY id`);
  return resultado.rows;
}

async function buscarPorId(id) {
  await initDatabase();
  const resultado = await pool.query(
    `SELECT ${CAMPOS_PUBLICOS} FROM usuarios WHERE id = $1`,
    [id]
  );
  return resultado.rows[0] || null;
}

async function buscarPorEmail(email, incluirSenha = false) {
  await initDatabase();
  const campos = incluirSenha ? `${CAMPOS_PUBLICOS}, senha_hash` : CAMPOS_PUBLICOS;
  const resultado = await pool.query(
    `SELECT ${campos} FROM usuarios WHERE LOWER(email) = LOWER($1)`,
    [String(email).trim()]
  );
  return resultado.rows[0] || null;
}

async function criar({ nome, email, senha, perfil = 'usuario' }) {
  await initDatabase();
  const resultado = await pool.query(
    `INSERT INTO usuarios (nome, email, senha_hash, perfil)
     VALUES ($1, LOWER($2), $3, $4)
     RETURNING ${CAMPOS_PUBLICOS}`,
    [nome, email, senha, perfil]
  );
  return resultado.rows[0];
}

async function atualizar(id, dados) {
  await initDatabase();
  const resultado = await pool.query(
    `UPDATE usuarios
     SET nome = $1,
         email = LOWER($2),
         senha_hash = COALESCE($3, senha_hash),
         perfil = $4
     WHERE id = $5
     RETURNING ${CAMPOS_PUBLICOS}`,
    [dados.nome, dados.email, dados.senha || null, dados.perfil, id]
  );
  return resultado.rows[0] || null;
}

async function excluir(id) {
  await initDatabase();
  const resultado = await pool.query(
    `DELETE FROM usuarios WHERE id = $1 RETURNING ${CAMPOS_PUBLICOS}`,
    [id]
  );
  return resultado.rows[0] || null;
}

const CAMPOS_PERFIL = 'id, nome, bio, avatar IS NOT NULL AS tem_avatar';

async function perfilSocial(id) {
  await initDatabase();
  const resultado = await pool.query(`SELECT ${CAMPOS_PERFIL} FROM usuarios WHERE id = $1`, [id]);
  return resultado.rows[0];
}

async function salvarPerfil(id, bio, alterarFoto, foto) {
  await initDatabase();
  const resultado = await pool.query(
    `UPDATE usuarios SET bio = $2, avatar = CASE WHEN $3 THEN $4 ELSE avatar END
     WHERE id = $1 RETURNING ${CAMPOS_PERFIL}`,
    [id, bio, alterarFoto, foto]
  );
  return resultado.rows[0];
}

async function buscarAvatar(id) {
  await initDatabase();
  const resultado = await pool.query('SELECT avatar FROM usuarios WHERE id = $1', [id]);
  return resultado.rows[0]?.avatar;
}

module.exports = {
  perfilSocial, salvarPerfil, buscarAvatar,
  listar,
  buscarPorId,
  buscarPorEmail,
  criar,
  atualizar,
  excluir,
  remover: excluir
};
