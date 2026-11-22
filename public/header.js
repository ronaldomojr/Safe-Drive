// Header padrão do Safe Drive — alterna o menu no mobile.
document.addEventListener('DOMContentLoaded', function () {
    var toggle = document.querySelector('.site-nav-toggle');
    var nav = document.querySelector('.site-nav');
    if (!toggle || !nav) return;

    toggle.addEventListener('click', function () {
        var aberto = nav.classList.toggle('open');
        toggle.setAttribute('aria-expanded', aberto);
    });
});

document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('safeDriveToken');
  const container = document.querySelector('.site-header-inner, #contaMapa');
  if (!token || !container) return;
  const link = document.createElement('a');
  link.className = 'avatar-conta';
  link.href = 'perfil.html';
  link.setAttribute('aria-label', 'Abrir meu perfil');
  link.textContent = 'Eu';
  container.append(link);
  let versao = 0;
  function exibir(perfil) {
    versao++;
    link.textContent = perfil.nome.trim().slice(0, 1).toUpperCase();
    if (perfil.tem_avatar) {
      const img = document.createElement('img');
      img.src = '/api/perfis/' + perfil.id + '/foto';
      img.alt = '';
      img.onerror = () => { if (img.parentElement === link) link.textContent = perfil.nome.trim().slice(0, 1); };
      link.replaceChildren(img);
    }
  }
  async function carregar() {
    const atual = ++versao;
    try {
      const r = await fetch('/api/perfil/resumo', { headers: { Authorization: 'Bearer ' + token }, cache:'no-store' });
      if (r.ok) {
        const perfil = await r.json();
        if (atual === versao) exibir(perfil);
      }
    } catch { /* O atalho para o perfil continua disponível. */ }
  }
  window.addEventListener('perfil-atualizado', e => exibir(e.detail));
  window.addEventListener('storage', e => { if (e.key === 'safeDrivePerfilAtualizado') carregar(); });
  window.addEventListener('pageshow', e => { if (e.persisted) carregar(); });
  await carregar();
});
