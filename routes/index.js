const fs = require('node:fs/promises');
const path = require('node:path');
const { home } = require('../controllers/homeController');
const { listAlerts, createAlert } = require('../controllers/alertsController');
const { listPosts, createPost } = require('../controllers/postsController');
const { renderPage } = require('../controllers/pageController');

const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

function sendJson(res, status, payload) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

async function serveStatic(req, res, publicDir) {
  const requestedPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  const relativePath = requestedPath === '/' ? 'index.html' : requestedPath.slice(1);
  const filePath = path.resolve(publicDir, relativePath);

  if (filePath !== publicDir && !filePath.startsWith(`${publicDir}${path.sep}`)) {
    return sendJson(res, 403, { error: 'Acesso negado.' });
  }

  try {
    const content = await fs.readFile(filePath);
    const type = MIME_TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type });
    res.end(content);
  } catch (error) {
    if (error.code === 'ENOENT') return sendJson(res, 404, { error: 'Recurso não encontrado.' });
    throw error;
  }
}

async function readRequestBody(req) {
  let body = '';
  for await (const chunk of req) body += chunk;
  if (!body) return {};

  const contentType = req.headers['content-type'] || '';
  if (contentType.includes('application/x-www-form-urlencoded')) {
    return Object.fromEntries(new URLSearchParams(body));
  }

  try {
    return JSON.parse(body);
  } catch {
    const error = new Error('JSON inválido.');
    error.statusCode = 400;
    throw error;
  }
}

async function router(req, res, { publicDir }) {
  const url = new URL(req.url, 'http://localhost');

  // Rotas de View: cada rota aponta para uma tela, sem conter regra de negócio.
  if (req.method === 'GET' && url.pathname === '/mvc') return home(req, res);
  const viewRoutes = {
    '/login': 'login',
    '/cadastro': 'cadastro',
    '/central': 'central',
    '/comunidade': 'comunidade',
    '/mapa': 'mapa',
    '/procurar': 'procurar',
    '/notificacoes': 'notificacoes',
    '/perfil': 'perfil',
    '/posts/novo': 'novoPost'
  };
  if (req.method === 'GET' && viewRoutes[url.pathname]) {
    return renderPage(req, res, publicDir, viewRoutes[url.pathname]);
  }

  // Rotas de ação: Controllers leem/escrevem nos Models e retornam o resultado.
  if (req.method === 'GET' && (url.pathname === '/alertas' || url.pathname === '/api/alertas')) {
    return listAlerts(req, res, url.searchParams);
  }
  if (req.method === 'POST' && (url.pathname === '/alertas' || url.pathname === '/api/alertas')) {
    return createAlert(req, res, await readRequestBody(req));
  }
  if (req.method === 'GET' && (url.pathname === '/posts' || url.pathname === '/api/posts')) {
    return listPosts(req, res, url.searchParams);
  }
  if (req.method === 'POST' && (url.pathname === '/posts' || url.pathname === '/api/posts')) {
    return createPost(req, res, await readRequestBody(req));
  }

  return serveStatic(req, res, publicDir);
}

module.exports = { router };
