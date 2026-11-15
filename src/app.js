const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const alertaRoutes = require('./routes/alertaRoutes');
const postModel = require('../models/postModel');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', userRoutes);
app.use('/api', alertaRoutes);

app.get('/api/status', (_req, res) => {
  res.status(200).json({ message: 'Safe Drive API', endpoints: ['/api/login', '/api/usuarios', '/api/alertas', '/api/posts'] });
});

app.get('/api/posts', (req, res) => {
  const data = postModel.findAll(req.query.q);
  res.status(200).json({ data, total: data.length });
});

app.post('/api/posts', (req, res) => {
  if (!req.body?.titulo) return res.status(400).json({ erro: 'O campo título é obrigatório.' });
  return res.status(201).json({ data: postModel.create(req.body) });
});

app.use((erro, _req, res, _next) => {
  if (erro instanceof SyntaxError && 'body' in erro) return res.status(400).json({ erro: 'JSON inválido.' });
  console.error(erro);
  return res.status(500).json({ erro: 'Erro interno do servidor.' });
});

module.exports = app;
