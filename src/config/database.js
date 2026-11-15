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

  const senhaHash = await bcrypt.hash('Admin@123', 10);
  await pool.query(
    `INSERT INTO usuarios (nome, email, senha_hash, perfil)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (email) DO NOTHING`,
    ['Administrador Safe Drive', 'admin@safedrive.com', senhaHash, 'admin']
  );

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
