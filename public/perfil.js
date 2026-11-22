const id = new URLSearchParams(location.search).get('id');
const statusPerfil = document.querySelector('#status');
const editor = document.querySelector('#editor');
const editar = document.querySelector('#editar');
const retorno = document.querySelector('#retorno');
const autorizacao = { Authorization: 'Bearer ' + sessao };
let perfil;

function mostrarIdentidade(dados) {
  perfil = dados;
  document.title = perfil.nome + ' | Safe Drive';
  document.querySelector('#nome').textContent = perfil.nome;
  document.querySelector('#bio').textContent = perfil.bio;
  const avatar = comunidade.avatar(perfil.nome, perfil.id, perfil.tem_avatar);
  document.querySelector('#avatar').replaceChildren(avatar);
  document.querySelector('#identidade').hidden = false;
}

function mostrarPosts(posts) {
  const grade = document.querySelector('#grade');
  for (const post of posts) {
    const link = comunidade.elemento('a', '', 'post-thumbnail');
    link.href = 'central.html#post-' + post.id;
    link.setAttribute('aria-label', post.titulo);
    if (post.tem_foto) {
      const foto = document.createElement('img');
      foto.src = '/api/posts/' + post.id + '/foto';
      foto.alt = post.titulo;
      foto.loading = 'lazy';
      link.append(foto);
    } else {
      const resumo = comunidade.elemento('div', '', 'post-thumbnail-text');
      resumo.append(comunidade.elemento('small', post.categoria), comunidade.elemento('strong', post.titulo));
      link.append(resumo);
    }
    grade.append(link);
  }
  document.querySelector('#contagem').textContent = posts.length + (posts.length === 1 ? ' publicação' : ' publicações');
  document.querySelector('#vazio').hidden = posts.length > 0;
  document.querySelector('#publicacoes').hidden = false;
}

function solicitarLogin() {
  document.querySelector('#entrar').hidden = false;
  statusPerfil.textContent = 'Entre para acessar seu perfil.';
}

async function carregar() {
  if (id === null && !sessao) return solicitarLogin();
  try {
    const r = await fetch(id === null ? '/api/perfil' : '/api/perfis/' + encodeURIComponent(id), {
      headers: id === null ? autorizacao : {}, cache: 'no-store'
    });
    if (r.status === 401 || r.status === 403) return solicitarLogin();
    if (!r.ok) throw new Error(r.status === 404 ? 'Perfil não encontrado.' : 'Não foi possível carregar o perfil.');
    const dados = await r.json();
    mostrarIdentidade(dados.perfil);
    mostrarPosts(dados.posts);
    editar.hidden = !dados.editavel;
    statusPerfil.textContent = '';
  } catch (erro) { statusPerfil.textContent = erro.message; }
}

function fecharEditor() {
  editor.hidden = true;
  editar.setAttribute('aria-expanded', 'false');
  editar.focus();
}
editar.onclick = () => {
  if (!editor.hidden) return fecharEditor();
  editor.reset();
  editor.elements.bio.value = perfil.bio;
  document.querySelector('#removerLabel').hidden = !perfil.tem_avatar;
  retorno.textContent = '';
  statusPerfil.textContent = '';
  editor.hidden = false;
  editar.setAttribute('aria-expanded', 'true');
  editor.elements.bio.focus();
};
document.querySelector('#cancelar').onclick = fecharEditor;
editor.elements.foto.onchange = () => { editor.elements.remover.checked = false; };
editor.elements.remover.onchange = () => { if (editor.elements.remover.checked) editor.elements.foto.value = ''; };
editor.onsubmit = async event => {
  event.preventDefault();
  const dados = { bio: editor.elements.bio.value };
  const arquivo = editor.elements.foto.files[0];
  const url = arquivo ? URL.createObjectURL(arquivo) : null;
  const fields = editor.querySelector('fieldset');
  fields.disabled = true;
  editar.disabled = true;
  retorno.textContent = 'Salvando…';
  try {
    if (arquivo) dados.foto = await prepararFoto(arquivo, url, [480, 320]);
    else if (editor.elements.remover.checked) dados.foto = null;
    const r = await fetch('/api/perfil', {
      method: 'PUT', headers: { ...autorizacao, 'Content-Type': 'application/json' },
      body: JSON.stringify(dados)
    });
    if (r.status === 401 || r.status === 403) { solicitarLogin(); throw new Error('Sua sessão expirou. Entre novamente.'); }
    const resposta = await r.json();
    if (!r.ok) throw new Error(resposta.erro || 'Falha ao salvar o perfil.');
    mostrarIdentidade(resposta.perfil);
    fecharEditor();
    statusPerfil.textContent = 'Perfil atualizado.';
  } catch (erro) { retorno.textContent = erro.message; }
  finally {
    fields.disabled = false;
    editar.disabled = false;
    if (url) URL.revokeObjectURL(url);
  }
};
carregar();
