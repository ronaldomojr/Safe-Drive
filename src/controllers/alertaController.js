const alertaModel = require('../models/alertaModel');

async function listar(_req, res) {
  const alertas = await alertaModel.listarAlertas();
  return res.status(200).json({ data: alertas, total: alertas.length });
}

async function criar(req, res) {
  const { titulo, categoria = 'transito', descricao, cep, localizacao } = req.body || {};
  const camposObrigatorios = { titulo, descricao, localizacao };
  const ausentes = Object.entries(camposObrigatorios)
    .filter(([, valor]) => valor === undefined || valor === null || String(valor).trim() === '')
    .map(([campo]) => campo);

  if (ausentes.length) {
    return res.status(400).json({ erro: `Campos obrigatórios: ${ausentes.join(', ')}.` });
  }

  const alerta = await alertaModel.criarAlerta({
    usuario_id: req.usuario.id,
    titulo: String(titulo).trim(),
    categoria: String(categoria || 'transito').trim() || 'transito',
    descricao: String(descricao).trim(),
    cep: cep ? String(cep).trim() : null,
    localizacao: String(localizacao).trim()
  });
  return res.status(201).json({ data: alerta });
}

async function excluir(req, res) {
  const alerta = await alertaModel.buscarAlertaPorId(req.params.id);
  if (!alerta) return res.status(404).json({ erro: 'Alerta não encontrado.' });

  const eAutor = alerta.usuario_id === req.usuario.id;
  const eAdministrador = req.usuario.perfil === 'admin';
  if (!eAutor && !eAdministrador) {
    return res.status(403).json({ erro: 'Apenas o autor ou um administrador pode excluir este alerta.' });
  }

  await alertaModel.excluirAlerta(req.params.id);
  return res.status(200).json({ mensagem: 'Alerta excluído com sucesso.', alerta });
}

module.exports = { listar, criar, excluir };
