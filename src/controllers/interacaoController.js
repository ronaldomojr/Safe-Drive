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

async function meusVotos(req, res) {
  await initDatabase();
  const resultado = await pool.query('SELECT post_id, voto FROM votos_veracidade WHERE usuario_id = $1', [req.usuario.id]);
  return res.json(resultado.rows);
}

async function votar(req, res) {
  const voto = req.body?.voto;
  if (![null, 'sim', 'nao'].includes(voto)) return res.status(400).json({ erro: 'Voto inválido.' });
  await initDatabase();
  const chaves = [req.params.id, req.usuario.id];
  if (voto === null) {
    await pool.query('DELETE FROM votos_veracidade WHERE post_id = $1 AND usuario_id = $2', chaves);
  } else {
    try {
      await pool.query(
        `INSERT INTO votos_veracidade (post_id, usuario_id, voto) VALUES ($1,$2,$3)
         ON CONFLICT (post_id, usuario_id) DO UPDATE SET voto = EXCLUDED.voto`, [...chaves, voto]);
    } catch (erro) {
      if (erro.code === '23503') return res.sendStatus(404);
      throw erro;
    }
  }
  const resultado = await pool.query(
    `SELECT COUNT(*) FILTER (WHERE voto = 'sim')::int AS sim,
            COUNT(*) FILTER (WHERE voto = 'nao')::int AS nao,
            MAX(voto) FILTER (WHERE usuario_id = $2) AS meu
     FROM votos_veracidade WHERE post_id = $1`, chaves);
  return res.json(resultado.rows[0]);
}

module.exports = { meusVotos, votar, minhas, curtir, descurtir, listar, comentar };
