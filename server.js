const path = require('node:path');
const app = require('./src/app');

const PORT = Number(process.env.PORT) || 3000;

// Arquivos estáticos são servidos localmente por Express. Na Vercel, a CDN
// publica diretamente o diretório public/ e somente /api/* executa a função.
app.use(require('express').static(path.join(__dirname, 'public')));

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Safe Drive rodando em http://localhost:${PORT}`);
  });
}

module.exports = app;
