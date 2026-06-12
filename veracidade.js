/* ============================================================
   Sistema de avaliação de veracidade das ocorrências (Central)
   A comunidade vota se a informação "Confere" ou é "Duvidosa".
   Mostra barra de credibilidade + veredito. Votos salvos em
   localStorage (1 voto por post por navegador, pode trocar/desfazer).
   ============================================================ */
(function () {
    const CHAVE_DADOS = 'sd_veracidade_v1';
    const CHAVE_VOTOS = 'sd_meu_voto_v1';

    // Números base por post (para a página já começar "viva")
    const SEEDS = {
        '1': { sim: 18, nao: 2 },
        '2': { sim: 9,  nao: 5 },
        '3': { sim: 14, nao: 1 },
        '4': { sim: 6,  nao: 4 },
        '5': { sim: 11, nao: 3 },
        '6': { sim: 7,  nao: 2 },
        '7': { sim: 21, nao: 1 }
    };

    function carregar(chave, padrao) {
        try { return JSON.parse(localStorage.getItem(chave)) || padrao; }
        catch (e) { return padrao; }
    }
    function salvar(chave, valor) {
        try { localStorage.setItem(chave, JSON.stringify(valor)); } catch (e) {}
    }

    const dados = carregar(CHAVE_DADOS, {});
    const meusVotos = carregar(CHAVE_VOTOS, {});

    function contagem(id) {
        if (!dados[id]) {
            dados[id] = Object.assign({ sim: 0, nao: 0 }, SEEDS[id] || {});
        }
        return dados[id];
    }

    function render(id, bloco) {
        const c = contagem(id);
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

        bloco.querySelector('.vera-sim').classList.toggle('votado', meusVotos[id] === 'sim');
        bloco.querySelector('.vera-nao').classList.toggle('votado', meusVotos[id] === 'nao');
    }

    function votar(id, tipo, bloco) {
        const c = contagem(id);
        const atual = meusVotos[id];

        if (atual === tipo) {
            // Clicou no mesmo voto → desfaz
            c[tipo] = Math.max(0, c[tipo] - 1);
            delete meusVotos[id];
        } else {
            if (atual) c[atual] = Math.max(0, c[atual] - 1);
            c[tipo] += 1;
            meusVotos[id] = tipo;
        }

        salvar(CHAVE_DADOS, dados);
        salvar(CHAVE_VOTOS, meusVotos);
        render(id, bloco);
    }

    document.addEventListener('DOMContentLoaded', function () {
        const cards = document.querySelectorAll('.member-card[data-post-id]');

        cards.forEach(function (card) {
            const id = card.getAttribute('data-post-id');

            const bloco = document.createElement('div');
            bloco.className = 'veracidade';
            bloco.innerHTML =
                '<div class="veracidade-pergunta">🛡️ Essa informação é verídica?</div>' +
                '<div class="veracidade-botoes">' +
                    '<button type="button" class="vera-btn vera-sim">👍 Confere (<span class="c-sim">0</span>)</button>' +
                    '<button type="button" class="vera-btn vera-nao">👎 Duvidoso (<span class="c-nao">0</span>)</button>' +
                '</div>' +
                '<div class="veracidade-barra"><div class="veracidade-fill"></div></div>' +
                '<div class="veracidade-veredito"></div>';

            // Evita que cliques na área de votação naveguem para a página do post
            bloco.addEventListener('click', function (e) { e.stopPropagation(); });

            card.appendChild(bloco);

            bloco.querySelector('.vera-sim').addEventListener('click', function () { votar(id, 'sim', bloco); });
            bloco.querySelector('.vera-nao').addEventListener('click', function () { votar(id, 'nao', bloco); });

            render(id, bloco);
        });
    });
})();
