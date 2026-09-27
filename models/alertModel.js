// Mock Data: substitui temporariamente a camada de persistência.
const alertas = [
  {
    id: 1,
    tipo: 'acidente',
    titulo: 'Colisão no cruzamento',
    local: 'Avenida Brasil, 1200',
    latitude: -23.5505,
    longitude: -46.6333,
    veracidade: 85,
    status: 'ativo',
    criadoEm: '2026-09-27T12:00:00.000Z'
  },
  {
    id: 2,
    tipo: 'obra',
    titulo: 'Obra ocupa faixa da direita',
    local: 'Rua das Flores, 45',
    latitude: -23.5558,
    longitude: -46.6396,
    veracidade: 72,
    status: 'ativo',
    criadoEm: '2026-09-27T10:30:00.000Z'
  }
];

function findAll(filters = {}) {
  return alertas.filter((alerta) => {
    if (filters.tipo && alerta.tipo !== filters.tipo) return false;
    if (filters.status && alerta.status !== filters.status) return false;
    return true;
  });
}

function create(data) {
  const alerta = {
    id: alertas.length ? Math.max(...alertas.map((item) => item.id)) + 1 : 1,
    tipo: data.tipo,
    titulo: data.titulo,
    local: data.local,
    latitude: Number(data.latitude),
    longitude: Number(data.longitude),
    veracidade: Number(data.veracidade ?? 50),
    status: 'ativo',
    criadoEm: new Date().toISOString()
  };
  alertas.push(alerta);
  return alerta;
}

module.exports = { findAll, create };
