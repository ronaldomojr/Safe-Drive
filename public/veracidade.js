async function meusVotos() {
  if (!sessao) return new Map();
  const r = await fetch('/api/meus-votos', { headers: { Authorization: 'Bearer ' + sessao }, cache: 'no-store' });
  if (r.status === 401 || r.status === 403) return new Map();
  if (!r.ok) throw new Error('Falha ao carregar seus votos.');
  return new Map((await r.json()).map(item => [item.post_id, item.voto]));
}

function avaliacao(post, meu) {
  let estado = { sim: post.sim, nao: post.nao, meu };
  const bloco = document.createElement('section');
  bloco.className = 'veracidade';
  bloco.innerHTML =
      '<div class="veracidade-pergunta">🛡️ Essa informação é verídica?</div>' +
      '<div class="veracidade-botoes">' +
          '<button type="button" class="vera-btn vera-sim">👍 Confere (<span class="c-sim">0</span>)</button>' +
          '<button type="button" class="vera-btn vera-nao">👎 Duvidoso (<span class="c-nao">0</span>)</button>' +
      '</div>' +
      '<div class="veracidade-barra"><div class="veracidade-fill"></div></div>' +
      '<div class="veracidade-veredito"></div>';
  const aviso = comunidade.elemento('div', '');
  aviso.setAttribute('role', 'status');
  bloco.append(aviso);
  const botoes = bloco.querySelectorAll('button');
  function render() {
      const c = estado;
      const total = c.sim + c.nao;
      const pct = total ? Math.round((c.sim / total) * 100) : 0;

      bloco.querySelector('.c-sim').textContent = c.sim;
      bloco.querySelector('.c-nao').textContent = c.nao;

      const fill = bloco.querySelector('.veracidade-fill');
      fill.style.width = pct + '%';

      const veredito = bloco.querySelector('.veracidade-veredito');
      let texto, classe, cor;

      if (total < 5) {
          texto = '🕓 Em avaliação pela comunidade';
          classe = 'v-neutro';
          cor = '#999';
      } else if (pct >= 70) {
          texto = '✅ Verídico — ' + pct + '% confirmam';
          classe = 'v-ok';
          cor = '#27ae60';
      } else if (pct >= 40) {
          texto = '⚠️ Em dúvida — ' + pct + '% confirmam';
          classe = 'v-duvida';
          cor = '#e69100';
      } else {
          texto = '❌ Suspeito — só ' + pct + '% confirmam';
          classe = 'v-falso';
          cor = '#e74c3c';
      }

      veredito.textContent = texto;
      veredito.className = 'veracidade-veredito ' + classe;
      fill.style.background = cor;

      botoes[0].setAttribute('aria-pressed', String(estado.meu === 'sim'));
      botoes[1].setAttribute('aria-pressed', String(estado.meu === 'nao'));
      bloco.querySelector('.vera-sim').classList.toggle('votado', estado.meu === 'sim');
      bloco.querySelector('.vera-nao').classList.toggle('votado', estado.meu === 'nao');
  }

  async function registrar(tipo) {
    if (!sessao) {
      const entrar = comunidade.elemento('a', 'Entre para votar.');
      entrar.href = 'index.html';
      aviso.replaceChildren(entrar);
      return;
    }
    botoes.forEach(b => b.disabled = true);
    try {
      const r = await fetch('/api/posts/' + post.id + '/voto', {
        method: 'PUT', headers: { Authorization: 'Bearer ' + sessao, 'Content-Type': 'application/json' },
        body: JSON.stringify({ voto: estado.meu === tipo ? null : tipo })
      });
      if (!r.ok) throw new Error(r.status === 403 || r.status === 401 ? 'Entre novamente para votar.' : 'Falha ao salvar o voto.');
      estado = await r.json();
      aviso.textContent = '';
      render();
    } catch (erro) { aviso.textContent = erro.message; }
    finally { botoes.forEach(b => b.disabled = false); }
  }
  botoes[0].onclick = () => registrar('sim');
  botoes[1].onclick = () => registrar('nao');
  render();
  return bloco;
}
