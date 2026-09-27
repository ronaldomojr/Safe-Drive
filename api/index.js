const { router } = require('../routes');

// Entry point serverless da Vercel. O servidor local continua usando server.js.
module.exports = async function vercelHandler(req, res) {
  const incomingUrl = new URL(req.url, 'http://localhost');
  // `route` atende aos rewrites das Views; `path` é preenchido pela Vercel
  // no rewrite /api/:path* -> /api/index.
  const explicitRoute = incomingUrl.searchParams.get('route');
  const apiPath = incomingUrl.searchParams.get('path');
  const route = explicitRoute || (apiPath ? `/api/${apiPath}` : null);

  if (route) {
    incomingUrl.searchParams.delete('route');
    incomingUrl.searchParams.delete('path');
    req.url = `${route}${incomingUrl.search ? incomingUrl.search : ''}`;
  }

  return router(req, res, { publicDir: process.cwd() });
};
