const alertaModel = require('../models/alertaModel');

async function listar(req, res) {
  const alertas = await alertaModel.listarAlertas(typeof req.query.q === 'string' ? req.query.q : '');
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

  const { latitude, longitude, foto } = req.body;
  if (req.path === '/posts' || latitude != null || longitude != null) {
    if (!Number.isFinite(latitude) || Math.abs(latitude) > 90 ||
        !Number.isFinite(longitude) || Math.abs(longitude) > 180) {
      return res.status(400).json({ erro: 'Marque um ponto válido no mapa.' });
    }
  }
  if ([titulo, descricao, localizacao, categoria].some(valor => typeof valor !== 'string') ||
      titulo.length > 150 || descricao.length > 5000 || localizacao.length > 200 ||
      categoria.length > 50 || (cep && String(cep).length > 10)) {
    return res.status(400).json({ erro: 'Confira o tamanho e o formato dos campos.' });
  }
  let imagem = null;
  if (foto != null) {
    if (typeof foto !== 'string' || foto.length > 349528 || !/^[A-Za-z0-9+/]+={0,2}$/.test(foto)) {
      return res.status(400).json({ erro: 'Envie uma foto JPEG de até 256 KiB.' });
    }
    imagem = Buffer.from(foto, 'base64');
    if (imagem.length > 262144 || imagem.length < 4 ||
        imagem.readUIntBE(0, 3) !== 0xffd8ff || imagem.readUInt16BE(imagem.length - 2) !== 0xffd9) {
      return res.status(400).json({ erro: 'Foto JPEG inválida.' });
    }
  }

  const alerta = await alertaModel.criarAlerta({
    usuario_id: req.usuario.id,
    latitude, longitude, foto: imagem,
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

async function foto(req, res) {
  const imagem = await alertaModel.buscarFoto(req.params.id);
  if (!imagem) return res.sendStatus(404);
  return res.set('X-Content-Type-Options', 'nosniff').type('image/jpeg').send(imagem);
}

module.exports = { foto, listar, criar, excluir };
