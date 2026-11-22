const feed = document.querySelector('#feed');
const statusFeed = document.querySelector('#status');
const search = document.querySelector('.search');
const el = comunidade.elemento;
function card(post) {
  const article = el('article', '', 'post');
  article.id = 'post-' + post.id;
  article.append(el('span', post.categoria, 'category'), el('h2', post.titulo),
    el('div', post.autor_nome + ' · ' + new Date(post.criado_em).toLocaleString('pt-BR'), 'meta'),
    el('p', post.descricao));
  if (post.tem_foto) {
    const foto = document.createElement('img');
    foto.src = '/api/posts/' + post.id + '/foto';
    foto.alt = 'Foto da ocorrência: ' + post.titulo;
    foto.loading = 'lazy';
    article.append(foto);
  }
  const footer = el('footer', post.localizacao + ' ');
  if (post.latitude != null && post.longitude != null) {
    const link = el('a', 'Ver no mapa ↗');
    link.href = 'mapa.html?post=' + post.id;
    footer.append(link);
  }
  article.append(footer);
  return article;
}
let request = 0;
async function carregar() {
  const numero = ++request;
  statusFeed.textContent = 'Carregando posts…';
  try {
    const posts = await comunidade.listar(search.elements.q.value.trim());
    if (numero !== request) return;
    feed.replaceChildren(...posts.map(card));
    statusFeed.textContent = posts.length ? '' : 'Nenhuma ocorrência encontrada.';
    document.getElementById(location.hash.slice(1))?.scrollIntoView();
  } catch {
    if (numero === request) statusFeed.textContent = 'Não foi possível carregar os posts. Use Buscar para tentar novamente.';
  }
}
search.onsubmit = event => { event.preventDefault(); carregar(); };
carregar();
