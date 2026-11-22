const voltaRedonda = [-22.5203, -44.104];
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
  avatar(nome, id, temFoto) {
    if (!temFoto) {
      const palavras = nome.trim().split(/\s+/);
      return document.createTextNode((palavras[0][0] + (palavras.length > 1 ? palavras.at(-1)[0] : '')).toUpperCase());
    }
    const foto = document.createElement('img');
    foto.src = '/api/perfis/' + id + '/foto';
    foto.alt = '';
    return foto;
  },
  mapa(id) {
    const mapa = L.map(id).setView(voltaRedonda, 14);
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
