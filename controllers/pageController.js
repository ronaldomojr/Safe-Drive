const fs = require('node:fs/promises');
const path = require('node:path');

const pageFiles = {
  login: 'index.html',
  cadastro: 'cadastro.html',
  central: 'central.html',
  comunidade: 'central.html',
  mapa: 'mapa.html',
  procurar: 'procurar.html',
  notificacoes: 'notificacoes.html',
  perfil: 'lucas-perfil.html',
  novoPost: 'react.html'
};

async function renderPage(_req, res, publicDir, pageName) {
  const fileName = pageFiles[pageName];
  if (!fileName) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('Página não encontrada.');
  }

  const filePath = path.join(publicDir, fileName);
  const html = await fs.readFile(filePath, 'utf8');
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  return res.end(html);
}

module.exports = { renderPage };
