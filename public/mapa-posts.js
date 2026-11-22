const listaMapa = document.querySelector('#listaMapa');
const avisoMapa = document.querySelector('#avisoMapa');
const detalhesMapa = document.querySelector('#painelMapa');
const alfinetes = new Map();
let alvo = new URLSearchParams(location.search).get('post');
let primeiraCarga = true;
const gpsMapa = document.querySelector('#gpsMapa');
const limparGpsMapa = controleLocalizacao(map, gpsMapa, document.querySelector('#posicaoMapa'), (ponto, precisao) => {
  primeiraCarga = false;
  origemGps(ponto, precisao);
});
let carregando = false;
let atualizarNovamente = false;
function focar(marker) {
  detalhesMapa.open = false;
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
async function atualizarMapa() {
  if (carregando) { atualizarNovamente = true; return; }
  carregando = true;
  try {
    const posts = (await comunidade.listar()).filter(p => p.latitude != null && p.longitude != null);
    const ids = new Set(posts.map(p => p.id));
    for (const [id, marker] of alfinetes) {
      if (!ids.has(id)) {
        map.removeLayer(marker);
        alfinetes.delete(id);
      }
    }
    listaMapa.replaceChildren();
    for (const post of posts) {
      let marker = alfinetes.get(post.id);
      if (!marker) {
        marker = L.marker([post.latitude, post.longitude], { title: post.titulo }).addTo(map);
        alfinetes.set(post.id, marker);
      }
      marker.bindPopup(() => popupDoPost(post));
      const item = comunidade.elemento('button', post.categoria + ' · ' + post.titulo);
      item.onclick = () => focar(marker);
      listaMapa.append(item);
    }
    avisoMapa.textContent = posts.length ? '' : 'Ainda não há posts com localização.';
    if (primeiraCarga) {
      if (alvo && alfinetes.has(Number(alvo))) focar(alfinetes.get(Number(alvo)));

      if (alvo && !alfinetes.has(Number(alvo))) avisoMapa.textContent = 'Esta ocorrência não está disponível no mapa.';
      primeiraCarga = false;
    }
  } catch {
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
