module.exports = function statusHandler(_req, res) {
  res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify({
    message: 'Safe Drive API',
    endpoints: ['/api/alertas', '/api/posts']
  }));
};
