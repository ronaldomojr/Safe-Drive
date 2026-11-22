const feed = document.querySelector('#feed');
const statusFeed = document.querySelector('#status');
const search = document.querySelector('.search');
const el = comunidade.elemento;
function card(post, curtidas, votos) {
  const article = el('article', '', 'post member-card');
  article.id = 'post-' + post.id;
  const header = el('div', '', 'member-header');
  const autor = el('a', '', 'member-info');
  autor.href = 'perfil.html?id=' + post.usuario_id;
  const avatar = el('span', '', 'avatar-placeholder');
  avatar.append(comunidade.avatar(post.autor_nome, post.usuario_id, post.autor_tem_avatar));
  const detalhes = el('div', '', 'member-details');
  detalhes.append(el('strong', post.autor_nome, 'member-name'),
    el('span', new Date(post.criado_em).toLocaleString('pt-BR'), 'member-time'));
  autor.append(avatar, detalhes);
  header.append(autor, el('span', post.categoria, 'member-status status-new'));
  const corpo = el('div', '', 'member-description');
  corpo.append(el('h2', post.titulo), el('p', post.descricao));
  article.append(header, corpo);
  if (post.tem_foto) {
    const moldura = el('div', '', 'post-image-container');
    const foto = document.createElement('img');
    foto.src = '/api/posts/' + post.id + '/foto';
    foto.alt = 'Foto da ocorrência: ' + post.titulo;
    foto.loading = 'lazy';
    moldura.append(foto);
    article.append(moldura);
  }
  const actions = el('div', '', 'post-actions');
  actions.append(el('span', post.localizacao, 'local'));
  if (post.latitude != null && post.longitude != null) {
    const link = el('a', 'Ver no mapa');
    link.prepend(comunidade.icone('fas fa-map-marker-alt'), ' ');
    link.href = 'mapa.html?post=' + post.id;
    actions.append(link);
  }
  article.append(actions, interacoes(post, curtidas.has(post.id)), avaliacao(post, votos.get(post.id)));
  return article;
}
let request = 0;
async function carregar() {
  const numero = ++request;
  statusFeed.textContent = 'Carregando posts…';
  try {
    const [posts, curtidas, votos] = await Promise.all([
      comunidade.listar(search.elements.q.value.trim()), minhasCurtidas(), meusVotos()
    ]);
    if (numero !== request) return;
    feed.replaceChildren(...posts.map(post => card(post, curtidas, votos)));
    statusFeed.textContent = posts.length ? '' : 'Nenhuma ocorrência encontrada.';
    document.getElementById(location.hash.slice(1))?.scrollIntoView();
  } catch {
    if (numero === request) statusFeed.textContent = 'Não foi possível carregar os posts. Use Buscar para tentar novamente.';
  }
}
search.onsubmit = event => { event.preventDefault(); carregar(); };
carregar();
window.addEventListener('storage', e => { if (e.key === 'safeDrivePostExcluido' || e.key === 'safeDrivePerfilAtualizado') carregar(); });
window.addEventListener('pageshow', e => { if (e.persisted) carregar(); });
