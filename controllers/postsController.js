const postModel = require('../models/postModel');

function sendJson(res, status, payload) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

function listPosts(_req, res, searchParams) {
  const posts = postModel.findAll(searchParams.get('q'));
  return sendJson(res, 200, { data: posts, total: posts.length });
}

function createPost(_req, res, data) {
  const required = ['titulo'];
  const missing = required.filter((field) => data[field] === undefined || data[field] === '');
  if (missing.length) return sendJson(res, 400, { error: `Campos obrigatórios: ${missing.join(', ')}.` });
  return sendJson(res, 201, { data: postModel.create(data) });
}

module.exports = { listPosts, createPost };
