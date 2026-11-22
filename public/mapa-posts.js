const listaMapa = document.querySelector('#listaMapa');
const avisoMapa = document.querySelector('#avisoMapa');
const detalhesMapa = document.querySelector('#painelMapa');
const alfinetes = new Map();
let alvo = new URLSearchParams(location.search).get('post');
let primeiraCarga = true;
let carregando = false;
function focar(marker) {
  detalhesMapa.open = false;
  map.setView(marker.getLatLng(), 16);
  marker.openPopup();
}
async function atualizarMapa() {
  if (carregando) return;
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
        const popup = document.createElement('div');
        const link = comunidade.elemento('a', 'Abrir post');
        link.href = 'central.html#post-' + post.id;
        popup.append(comunidade.elemento('strong', post.titulo),
          comunidade.elemento('p', post.categoria + ' · ' + post.autor_nome),
          comunidade.elemento('p', post.localizacao), link);
        marker = L.marker([post.latitude, post.longitude], { title: post.titulo })
          .addTo(map).bindPopup(popup);
        alfinetes.set(post.id, marker);
      }
      const item = comunidade.elemento('button', post.categoria + ' · ' + post.titulo);
      item.onclick = () => focar(marker);
      listaMapa.append(item);
    }
    avisoMapa.textContent = posts.length ? '' : 'Ainda não há posts com localização.';
    if (primeiraCarga) {
      if (alvo && alfinetes.has(Number(alvo))) focar(alfinetes.get(Number(alvo)));
      else if (posts.length) map.fitBounds(posts.map(p => [p.latitude, p.longitude]), { maxZoom: 15 });
      if (alvo && !alfinetes.has(Number(alvo))) avisoMapa.textContent = 'Esta ocorrência não está disponível no mapa.';
      primeiraCarga = false;
    }
  } catch {
    avisoMapa.textContent = 'Falha ao atualizar os posts. Tente novamente.';
  } finally { carregando = false; }
}
document.querySelector('#atualizar').onclick = atualizarMapa;
document.addEventListener('visibilitychange', () => { if (!document.hidden) atualizarMapa(); });
setInterval(() => { if (!document.hidden) atualizarMapa(); }, 60000);
atualizarMapa();
