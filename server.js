const http = require('node:http');
const { router } = require('./routes');

const PORT = Number(process.env.PORT) || 3000;
// Durante a migração, os assets legados continuam sendo servidos pela raiz.
// O diretório public fica reservado para os novos assets da aplicação MVC.
const publicDir = __dirname;

const server = http.createServer(async (req, res) => {
  try {
    await router(req, res, { publicDir });
  } catch (error) {
    console.error(error);
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: 'Erro interno do servidor.' }));
    }
  }
});

server.listen(PORT, () => {
  console.log(`Safe Drive MVC rodando em http://localhost:${PORT}`);
});
