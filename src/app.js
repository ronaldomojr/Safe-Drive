const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const alertaRoutes = require('./routes/alertaRoutes');

const app = express();

app.use(cors());
app.post('/api/posts', express.json({ limit: '400kb' }));
app.use(express.json());

app.use('/api', userRoutes);
app.use('/api', alertaRoutes);

app.get('/api/status', (_req, res) => {
  res.status(200).json({ message: 'Safe Drive API', endpoints: ['/api/login', '/api/usuarios', '/api/alertas', '/api/posts'] });
});

app.use((erro, _req, res, _next) => {
  if (erro.type === 'entity.too.large') return res.status(413).json({ erro: 'Foto muito grande.' });
  if (erro instanceof SyntaxError && 'body' in erro) return res.status(400).json({ erro: 'JSON inválido.' });
  console.error(erro);
  return res.status(500).json({ erro: 'Erro interno do servidor.' });
});

module.exports = app;
