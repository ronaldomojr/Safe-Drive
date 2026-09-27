const alertModel = require('../models/alertModel');

function sendJson(res, status, payload) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

function listAlerts(_req, res, searchParams) {
  const alertas = alertModel.findAll({
    tipo: searchParams.get('tipo') || undefined,
    status: searchParams.get('status') || undefined
  });
  return sendJson(res, 200, { data: alertas, total: alertas.length });
}

function createAlert(_req, res, data) {
  const required = ['tipo', 'titulo', 'local', 'latitude', 'longitude'];
  const missing = required.filter((field) => data[field] === undefined || data[field] === '');
  if (missing.length) return sendJson(res, 400, { error: `Campos obrigatórios: ${missing.join(', ')}.` });

  const alerta = alertModel.create(data);
  return sendJson(res, 201, { data: alerta });
}

module.exports = { listAlerts, createAlert };
