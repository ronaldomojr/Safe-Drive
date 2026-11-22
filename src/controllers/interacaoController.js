const { pool, initDatabase } = require('../config/database');

async function minhas(req, res) {
  await initDatabase();
  const result = await pool.query('SELECT post_id FROM curtidas WHERE usuario_id = $1', [req.usuario.id]);
  res.json(result.rows.map(row => row.post_id));
}

async function curtir(req, res) {
  await initDatabase();
  try {
    await pool.query('INSERT INTO curtidas (post_id, usuario_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [req.params.id, req.usuario.id]);
    res.sendStatus(204);
  } catch (erro) { if (erro.code === '23503') return res.sendStatus(404); throw erro; }
}

async function descurtir(req, res) {
  await initDatabase();
  await pool.query('DELETE FROM curtidas WHERE post_id = $1 AND usuario_id = $2', [req.params.id, req.usuario.id]);
  res.sendStatus(204);
}

async function listar(req, res) {
  await initDatabase();
  const result = await pool.query(
    `SELECT c.id, c.usuario_id, u.nome, c.texto FROM comentarios c JOIN usuarios u ON u.id = c.usuario_id
     WHERE c.post_id = $1 ORDER BY c.id`, [req.params.id]
  );
  res.json(result.rows);
}

async function comentar(req, res) {
  const texto = req.body?.texto;
  if (typeof texto !== 'string' || !texto.trim() || texto.length > 500) {
    return res.status(400).json({ erro: 'Escreva um comentário de até 500 caracteres.' });
  }
  await initDatabase();
  try {
    await pool.query('INSERT INTO comentarios (post_id, usuario_id, texto) VALUES ($1,$2,$3)',
      [req.params.id, req.usuario.id, texto.trim()]);
    res.sendStatus(201);
  } catch (erro) { if (erro.code === '23503') return res.sendStatus(404); throw erro; }
}

module.exports = { minhas, curtir, descurtir, listar, comentar };
