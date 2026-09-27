const { router } = require('../routes');

// Entry point serverless da Vercel. O servidor local continua usando server.js.
module.exports = async function vercelHandler(req, res) {
  const incomingUrl = new URL(req.url, 'http://localhost');
  const route = incomingUrl.searchParams.get('route');

  if (route) {
    incomingUrl.searchParams.delete('route');
    req.url = `${route}${incomingUrl.search ? incomingUrl.search : ''}`;
  }

  return router(req, res, { publicDir: process.cwd() });
};
