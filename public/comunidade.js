const comunidade = {
  async listar(q = '') {
    const r = await fetch('/api/posts?q=' + encodeURIComponent(q), { cache: 'no-store' });
    if (!r.ok) throw new Error('Não foi possível carregar os posts.');
    return (await r.json()).data;
  },
  elemento(tag, texto, classe) {
    const el = document.createElement(tag);
    el.textContent = texto;
    if (classe) el.className = classe;
    return el;
  },
  mapa(id) {
    const mapa = L.map(id).setView([-22.5087, -44.0938], 14);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(mapa);
    return mapa;
  }
};
const sessao = localStorage.getItem('safeDriveToken');
if (sessao) {
  const entrar = document.querySelector('.site-nav-btn');
  if (entrar) {
    entrar.textContent = 'Sair';
    entrar.onclick = () => {
      localStorage.removeItem('safeDriveToken');
      localStorage.removeItem('safeDriveUsuario');
    };
  }
}
