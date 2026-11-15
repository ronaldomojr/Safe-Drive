const { listPosts, createPost } = require('../controllers/postsController');

async function readRequestBody(req) {
  let body = '';
  for await (const chunk of req) body += chunk;
  if (!body) return {};

  if ((req.headers['content-type'] || '').includes('application/x-www-form-urlencoded')) {
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

module.exports = async function postsHandler(req, res) {
  const url = new URL(req.url, 'http://localhost');
  if (req.method === 'GET') return listPosts(req, res, url.searchParams);
  if (req.method === 'POST') return createPost(req, res, await readRequestBody(req));

  res.writeHead(405, { 'Content-Type': 'application/json; charset=utf-8', Allow: 'GET, POST' });
  res.end(JSON.stringify({ error: 'Método não permitido.' }));
};
