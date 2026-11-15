const { pool, initDatabase } = require('../config/database');

async function listarAlertas() {
  await initDatabase();
  const resultado = await pool.query(`
    SELECT
      alertas.id,
      alertas.usuario_id,
      alertas.titulo,
      alertas.categoria,
      alertas.descricao,
      alertas.cep,
      alertas.localizacao,
      alertas.criado_em,
      usuarios.nome AS autor_nome
    FROM alertas
    INNER JOIN usuarios ON alertas.usuario_id = usuarios.id
    ORDER BY alertas.criado_em DESC
  `);
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

async function criarAlerta({ usuario_id, titulo, categoria = 'transito', descricao, cep, localizacao }) {
  await initDatabase();
  const resultado = await pool.query(
    `INSERT INTO alertas (usuario_id, titulo, categoria, descricao, cep, localizacao)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, usuario_id, titulo, categoria, descricao, cep, localizacao, criado_em`,
    [usuario_id, titulo, categoria, descricao, cep || null, localizacao]
  );
  return resultado.rows[0];
}

async function excluirAlerta(id) {
  await initDatabase();
  const resultado = await pool.query(
    `DELETE FROM alertas
     WHERE id = $1
     RETURNING id, usuario_id, titulo, categoria, descricao, cep, localizacao, criado_em`,
    [id]
  );
  return resultado.rows[0] || null;
}

module.exports = { listarAlertas, buscarAlertaPorId, criarAlerta, excluirAlerta };
