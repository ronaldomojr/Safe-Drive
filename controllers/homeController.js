const { renderHome } = require('../views/homeView');

function home(_req, res) {
  const html = renderHome();
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
}

module.exports = { home };
