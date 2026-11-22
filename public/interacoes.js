async function minhasCurtidas() {
  if (!sessao) return new Set();
  const r = await fetch('/api/minhas-curtidas', { headers: { Authorization: 'Bearer ' + sessao }, cache: 'no-store' });
  return new Set(r.ok ? await r.json() : []);
}

function interacoes(post, curtido) {
  const el = comunidade.elemento;
  const area = el('div', '', 'interacoes');
  const barra = el('div', '', 'post-actions');
  const like = el('button', '', 'action-btn');
  const comentarios = el('button', '', 'action-btn');
  const share = el('button', 'Compartilhar', 'action-btn');
  const aviso = el('p', '', 'feedback');
  aviso.setAttribute('role', 'status');
  const painel = el('section', '', 'comentarios');
  const lista = el('div', '');
  const form = document.createElement('form');
  const input = document.createElement('textarea');
  input.maxLength = 500;
  input.rows = 2;
  input.required = true;
  input.placeholder = 'Escreva um comentário';
  input.setAttribute('aria-label', input.placeholder);
  const enviar = el('button', 'Comentar');
  form.append(input, enviar);
  painel.append(lista, form);
  painel.hidden = true;
  form.hidden = !sessao;
  barra.append(like, comentarios, share);
  area.append(barra, aviso, painel);
  const api = '/api/posts/' + post.id;
  function rotulos() {
    like.textContent = (curtido ? '♥ ' : '♡ ') + 'Curtir · ' + post.curtidas;
    like.setAttribute('aria-pressed', String(curtido));
    comentarios.textContent = 'Comentários · ' + post.comentarios;
    comentarios.setAttribute('aria-expanded', String(!painel.hidden));
  }
  function pedirSessao() {
    const login = el('a', 'Entre para participar.');
    login.href = 'index.html';
    aviso.replaceChildren(login);
  }
  async function gravar(path, method, body) {
    const r = await fetch(api + path, { method, headers: {
      Authorization: 'Bearer ' + sessao, 'Content-Type': 'application/json'
    }, body: body && JSON.stringify(body) });
    if (r.status === 401 || r.status === 403) { pedirSessao(); return false; }
    if (!r.ok) throw new Error();
    aviso.textContent = '';
    return true;
  }
  like.onclick = async () => {
    if (!sessao) return pedirSessao();
    like.disabled = true;
    try {
      if (await gravar('/curtida', curtido ? 'DELETE' : 'PUT')) {
        post.curtidas += curtido ? -1 : 1;
        curtido = !curtido;
        rotulos();
      }
    } catch { aviso.textContent = 'Falha ao salvar a curtida.'; }
    finally { like.disabled = false; }
  };
  async function carregarComentarios() {
    const r = await fetch(api + '/comentarios', { cache: 'no-store' });
    if (!r.ok) throw new Error();
    const dados = await r.json();
    lista.replaceChildren(...dados.map(item => {
      const linha = el('p', '');
      const autor = el('a', item.nome);
      autor.href = 'perfil.html?id=' + item.usuario_id;
      linha.append(autor, ' · ' + item.texto);
      return linha;
    }));
    if (!dados.length) lista.textContent = 'Seja a primeira pessoa a comentar.';
    post.comentarios = dados.length;
    rotulos();
  }
  comentarios.onclick = async () => {
    painel.hidden = !painel.hidden;
    rotulos();
    if (painel.hidden) return;
    if (!sessao) pedirSessao();
    try { await carregarComentarios(); }
    catch { aviso.textContent = 'Falha ao carregar os comentários.'; }
  };
  form.onsubmit = async event => {
    event.preventDefault();
    if (!input.value.trim()) return;
    enviar.disabled = true;
    try {
      if (await gravar('/comentarios', 'POST', { texto: input.value })) {
        input.value = '';
        await carregarComentarios();
      }
    } catch { aviso.textContent = 'Não foi possível atualizar os comentários.'; }
    finally { enviar.disabled = false; }
  };
  share.onclick = async () => {
    const url = new URL('central.html#post-' + post.id, location.href).href;
    try {
      if (navigator.share) await navigator.share({ title: post.titulo, url });
      else { await navigator.clipboard.writeText(url); aviso.textContent = 'Link copiado.'; }
    } catch (erro) { if (erro.name !== 'AbortError') aviso.textContent = url; }
  };
  rotulos();
  return area;
}
