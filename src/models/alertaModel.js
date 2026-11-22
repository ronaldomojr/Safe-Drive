const { pool, initDatabase } = require('../config/database');

async function listarAlertas(q = '', autor = null) {
  await initDatabase();
  const resultado = await pool.query(`
    SELECT
      alertas.id,
      alertas.usuario_id,
      alertas.titulo,
      alertas.categoria,
      alertas.descricao,
      alertas.cep,
      alertas.latitude,
      alertas.longitude,
      alertas.foto IS NOT NULL AS tem_foto,
      alertas.localizacao,
      alertas.criado_em,
      (SELECT COUNT(*)::int FROM curtidas WHERE post_id = alertas.id) AS curtidas,
      (SELECT COUNT(*)::int FROM comentarios WHERE post_id = alertas.id) AS comentarios,
      usuarios.avatar IS NOT NULL AS autor_tem_avatar,
      usuarios.nome AS autor_nome
    FROM alertas
    INNER JOIN usuarios ON alertas.usuario_id = usuarios.id
    WHERE ($2::int IS NULL OR alertas.usuario_id = $2)
      AND ($1::text = '' OR strpos(lower(concat_ws(' ', titulo, descricao, categoria, localizacao)), lower($1)) > 0)
    ORDER BY alertas.criado_em DESC, alertas.id DESC
  `, [q, autor]);
  return resultado.rows;
}

async function buscarAlertaPorId(id) {
  await initDatabase();
  const resultado = await pool.query(
    `SELECT id, usuario_id, titulo, categoria, descricao, cep, localizacao, criado_em
     FROM alertas
     WHERE id = $1`,
    [id]
  );
  return resultado.rows[0] || null;
}

async function criarAlerta({ usuario_id, titulo, categoria = 'transito', descricao, cep, localizacao, latitude = null, longitude = null, foto = null }) {
  await initDatabase();
  const resultado = await pool.query(
    `INSERT INTO alertas (usuario_id, titulo, categoria, descricao, cep, localizacao, latitude, longitude, foto)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING id, usuario_id, titulo, categoria, descricao, cep, localizacao, latitude, longitude, foto IS NOT NULL AS tem_foto, criado_em`,
    [usuario_id, titulo, categoria, descricao, cep || null, localizacao, latitude, longitude, foto]
  );
  return resultado.rows[0];
}

async function excluirAlerta(id) {
  await initDatabase();
  const resultado = await pool.query(
    `DELETE FROM alertas
     WHERE id = $1
     RETURNING id, usuario_id, titulo, categoria, descricao, cep, localizacao, latitude, longitude, foto IS NOT NULL AS tem_foto, criado_em`,
    [id]
  );
  return resultado.rows[0] || null;
}

async function buscarFoto(id) {
  await initDatabase();
  const resultado = await pool.query('SELECT foto FROM alertas WHERE id = $1', [id]);
  return resultado.rows[0]?.foto;
}

module.exports = { buscarFoto, listarAlertas, buscarAlertaPorId, criarAlerta, excluirAlerta };
