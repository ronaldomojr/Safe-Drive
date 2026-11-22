const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const databaseUrl = process.env.DATABASE_URL || process.env.STORAGE_URL || process.env.POSTGRES_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL, STORAGE_URL ou POSTGRES_URL não foi configurada.');
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false }
});

let inicializacao;

async function inicializar() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id SERIAL PRIMARY KEY,
      nome VARCHAR(120) NOT NULL,
      email VARCHAR(150) UNIQUE NOT NULL,
      senha_hash TEXT NOT NULL,
      perfil VARCHAR(30) NOT NULL DEFAULT 'usuario',
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    ALTER TABLE usuarios
      ADD COLUMN IF NOT EXISTS bio VARCHAR(300) NOT NULL DEFAULT '',
      ADD COLUMN IF NOT EXISTS avatar BYTEA
  `);

  if (process.env.ADMIN_INITIAL_PASSWORD) {
    const senhaHash = await bcrypt.hash(process.env.ADMIN_INITIAL_PASSWORD, 10);
    await pool.query(
      `INSERT INTO usuarios (nome, email, senha_hash, perfil)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO NOTHING`,
      ['Administrador Safe Drive', 'admin@safedrive.com', senhaHash, 'admin']
    );
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS alertas (
      id SERIAL PRIMARY KEY,
      usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
      titulo VARCHAR(150) NOT NULL,
      categoria VARCHAR(50) NOT NULL DEFAULT 'transito',
      descricao TEXT NOT NULL,
      cep VARCHAR(10),
      localizacao VARCHAR(200) NOT NULL,
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  await pool.query(`
    ALTER TABLE alertas
      ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
      ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
      ADD COLUMN IF NOT EXISTS foto BYTEA
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS curtidas (
      post_id INTEGER REFERENCES alertas(id) ON DELETE CASCADE,
      usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
      PRIMARY KEY (post_id, usuario_id)
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS votos_veracidade (
      post_id INTEGER NOT NULL REFERENCES alertas(id) ON DELETE CASCADE,
      usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
      voto TEXT NOT NULL CHECK (voto IN ('sim', 'nao')),
      PRIMARY KEY (post_id, usuario_id)
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS comentarios (
      id SERIAL PRIMARY KEY,
      post_id INTEGER NOT NULL REFERENCES alertas(id) ON DELETE CASCADE,
      usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
      texto VARCHAR(500) NOT NULL
    )
  `);
  await pool.query('CREATE INDEX IF NOT EXISTS comentarios_post_id_idx ON comentarios(post_id, id)');

}

async function initDatabase() {
  if (!inicializacao) {
    inicializacao = inicializar().catch((erro) => {
      inicializacao = undefined;
      throw erro;
    });
  }

  return inicializacao;
}

module.exports = { pool, initDatabase };
