const listaMapa = document.querySelector('#listaMapa');
const avisoMapa = document.querySelector('#avisoMapa');
const alfinetes = new Map();
const alvo = new URLSearchParams(location.search).get('post');
let primeiraCarga = true;
let carregando = false;
let atualizarNovamente = false;
function focar(marker) {
  pararGpsMapa();
  map.setView(marker.getLatLng(), 16);
  marker.openPopup();
}
function popupDoPost(post) {
  const popup = comunidade.elemento('div', '', 'resumo-mapa');
  const autor = comunidade.elemento('a', '', 'autor-mapa');
  autor.href = 'perfil.html?id=' + post.usuario_id;
  const avatar = comunidade.elemento('span', '', 'mini-avatar');
  avatar.append(comunidade.avatar(post.autor_nome, post.usuario_id, post.autor_tem_avatar));
  autor.append(avatar, post.autor_nome);
  const link = comunidade.elemento('a', 'Abrir post');
  link.href = 'central.html#post-' + post.id;
  popup.append(autor, comunidade.elemento('strong', post.titulo),
    comunidade.elemento('span', post.categoria + ' · ' + post.localizacao));
  if (post.tem_foto) {
    const foto = document.createElement('img');
    foto.className = 'foto-ocorrencia';
    foto.src = '/api/posts/' + post.id + '/foto';
    foto.alt = 'Foto da ocorrência';
    popup.append(foto);
  }
  const ir = comunidade.elemento('button', 'Traçar rota até aqui');
  ir.onclick = () => { destinoPost(post); map.closePopup(); };
  popup.append(link, ir);
  return popup;
}
function cartaoMapa(post, marcador) {
  const el = comunidade.elemento;
  const card = el('article', '', 'floating-post-card');
  const cabecalho = el('div', '', 'member-header');
  const autor = el('a', '', 'member-info');
  autor.href = 'perfil.html?id=' + post.usuario_id;
  const avatar = el('span', '', 'avatar-placeholder');
  avatar.append(comunidade.avatar(post.autor_nome, post.usuario_id, post.autor_tem_avatar));
  const detalhes = el('span', '', 'member-details');
  detalhes.append(el('strong', post.autor_nome, 'member-name'), el('time', new Date(post.criado_em).toLocaleString('pt-BR'), 'member-time'));
  autor.append(avatar, detalhes);
  const categoria = el('div', '', 'status-location-wrapper');
  categoria.append(el('span', post.categoria, 'member-status status-veteran'));
  if (marcador) {
    const pin = el('button', '', 'location-indicator');
    pin.setAttribute('aria-label', 'Ver localização de ' + post.titulo);
    pin.append(el('i', '', 'fas fa-map-marker-alt'));
    pin.onclick = () => focar(marcador);
    categoria.append(pin);
  }
  cabecalho.append(autor, categoria);
  const link = el('a', '', 'corpo-post');
  link.href = 'central.html#post-' + post.id;
  const texto = el('div', '', 'member-description');
  texto.append(el('strong', post.titulo), el('div', post.descricao));
  link.append(texto);
  if (post.tem_foto) {
    const bloco = el('div', '', 'post-image-container');
    const foto = document.createElement('img');
    foto.src = '/api/posts/' + post.id + '/foto';
    foto.alt = 'Foto da ocorrência: ' + post.titulo;
    foto.loading = 'lazy';
    bloco.append(foto);
    link.append(bloco);
  }
  card.append(cabecalho, el('div', '', 'member-divider'), link);
  return card;
}
async function atualizarMapa() {
  if (carregando) { atualizarNovamente = true; return; }
  carregando = true;
  try {
    const posts = await comunidade.listar();
    const ids = new Set(posts.map(p => p.id));
    for (const [id, marker] of alfinetes) {
      if (!ids.has(id)) {
        map.removeLayer(marker);
        alfinetes.delete(id);
      }
    }
    const cards = document.createDocumentFragment();
    for (const post of posts) {
      let marker = alfinetes.get(post.id);
      if (post.latitude == null || post.longitude == null) { cards.append(cartaoMapa(post)); continue; }
      if (!marker) {
        const tipo = post.categoria.toLowerCase();
        const simbolo = tipo === 'obra' ? 'fa-tools' : tipo === 'batida' ? 'fa-car' : 'fa-road';
        const icon = L.divIcon({className:'pin-ocorrencia ' + (tipo === 'batida' ? 'batida' : ''),
          html:'<i class="fas ' + simbolo + '"></i>',iconSize:[24,24]});
        marker = L.marker([post.latitude, post.longitude], { title: post.titulo, icon }).addTo(map);
        alfinetes.set(post.id, marker);
      }
      marker.bindPopup(() => popupDoPost(post));
      cards.append(cartaoMapa(post, marker));
    }
    listaMapa.replaceChildren(cards);
    document.querySelector('#atualizar').hidden = true;
    avisoMapa.textContent = posts.length ? '' : 'Ainda não há postagens.';
    if (primeiraCarga) {
      if (alvo && alfinetes.has(Number(alvo))) focar(alfinetes.get(Number(alvo)));

      if (alvo && !alfinetes.has(Number(alvo))) avisoMapa.textContent = 'Esta ocorrência não está disponível no mapa.';
      primeiraCarga = false;
    }
  } catch {
    document.querySelector('#atualizar').hidden = false;
    avisoMapa.textContent = 'Falha ao atualizar os posts. Tente novamente.';
  } finally {
    carregando = false;
    if (atualizarNovamente) { atualizarNovamente = false; atualizarMapa(); }
  }
}
document.querySelector('#atualizar').onclick = atualizarMapa;
document.addEventListener('visibilitychange', () => { if (!document.hidden) atualizarMapa(); });
setInterval(() => { if (!document.hidden) atualizarMapa(); }, 60000);
atualizarMapa();
window.addEventListener('storage', e => {
  if (e.key === 'safeDrivePerfilAtualizado') atualizarMapa();
  if (e.key === 'safeDrivePostExcluido' && e.newValue) {
    const { id } = JSON.parse(e.newValue);
    alfinetes.get(id)?.remove();
    alfinetes.delete(id);
    atualizarMapa();
  }
});
window.addEventListener('pageshow', e => { if (e.persisted) atualizarMapa(); });
