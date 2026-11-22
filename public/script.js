const map = comunidade.mapa('map');

const SearchControl = L.Control.extend({
    onAdd: function () {
        const container = L.DomUtil.create("div", "search-card");

        container.innerHTML = `
            <div class="search-box">
                <img src="https://cdn-icons-png.flaticon.com/512/54/54481.png" class="icon-left">
                <input type="text" placeholder="Para onde você está indo?">
                <img src="https://cdn-icons-png.flaticon.com/512/709/709631.png" class="icon-right">
            </div>

            <div class="recent-title">Locais recentes</div>

            <div class="recent-item" data-local="Casa">
                <div class="recent-item-left">
                    <img src="https://cdn-icons-png.flaticon.com/512/1946/1946433.png">
                    <div>
                        <div>Casa</div>
                        <div class="subtitle">Defina uma vez e pronto</div>
                    </div>
                </div>
                <img src="https://cdn-icons-png.flaticon.com/512/271/271228.png" width="16">
            </div>

            <div class="recent-item" data-local="Trabalho">
                <div class="recent-item-left">
                    <img src="https://cdn-icons-png.flaticon.com/512/3103/3103446.png">
                    <div>
                        <div>Trabalho</div>
                        <div class="subtitle">Defina uma vez e pronto</div>
                    </div>
                </div>
                <img src="https://cdn-icons-png.flaticon.com/512/271/271228.png" width="16">
            </div>
        `;

        // Evita zoom/drag quando usar o card
        L.DomEvent.disableScrollPropagation(container);
        L.DomEvent.disableClickPropagation(container);

        // Abre o pop-up de endereço (API ViaCEP) ao clicar em "Casa"/"Trabalho"
        container.querySelectorAll(".recent-item").forEach(function (item) {
            item.addEventListener("click", function () {
                abrirPopupEndereco(item.getAttribute("data-local"));
            });
        });

        return container;
    }
});

map.addControl(new SearchControl({ position: "topleft" }));

/* ===========================================================
   POP-UP DE ENDEREÇO + API ViaCEP (abas Casa / Trabalho)
   =========================================================== */

const locaisSalvos = {}; // marcadores de Casa/Trabalho definidos pelo usuário

function abrirPopupEndereco(local) {
    fecharPopupEndereco();

    const overlay = document.createElement("div");
    overlay.className = "endereco-overlay";
    overlay.id = "enderecoOverlay";

    overlay.innerHTML = `
        <div class="endereco-popup">
            <div class="endereco-popup-header">
                <div class="endereco-titulo">
                    <img src="Imagens/image-removebg-preview (1).png" alt="Safe Drive" class="endereco-logo">
                    <div class="endereco-titulo-texto">
                        <span class="endereco-marca">Safe Drive</span>
                        <span class="endereco-sub">Definir endereço — ${local}</span>
                    </div>
                </div>
                <button type="button" class="endereco-fechar" id="enderecoFechar" aria-label="Fechar">&times;</button>
            </div>

            <div class="endereco-corpo">
                <label class="endereco-label" for="cep">CEP</label>
                <input type="text" id="cep" class="endereco-input" placeholder="Digite o CEP"
                       maxlength="9" onblur="pesquisacep(this.value);" autocomplete="off">

                <label class="endereco-label">Endereço</label>
                <input type="text" id="rua" class="endereco-input" placeholder="Rua / Logradouro">
                <input type="text" id="bairro" class="endereco-input" placeholder="Bairro">

                <div class="endereco-linha">
                    <input type="text" id="cidade" class="endereco-input" placeholder="Cidade">
                    <input type="text" id="uf" class="endereco-input endereco-uf" placeholder="UF" maxlength="2">
                </div>

                <input type="hidden" id="ibge">

                <button type="button" class="endereco-salvar" id="enderecoSalvar">Salvar local</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    document.getElementById("enderecoFechar").addEventListener("click", fecharPopupEndereco);
    overlay.addEventListener("click", function (e) {
        if (e.target === overlay) fecharPopupEndereco();
    });
    document.getElementById("enderecoSalvar").addEventListener("click", function () {
        salvarLocal(local);
    });
}

function fecharPopupEndereco() {
    const existente = document.getElementById("enderecoOverlay");
    if (existente) existente.remove();
}

/* ---------- Funções da API ViaCEP (JSONP via callback) ---------- */

function limpa_formulario_cep() {
    document.getElementById('rua').value = "";
    document.getElementById('bairro').value = "";
    document.getElementById('cidade').value = "";
    document.getElementById('uf').value = "";
    document.getElementById('ibge').value = "";
}

// Callback chamado automaticamente pela resposta da API ViaCEP
function meu_callback(conteudo) {
    if (!("erro" in conteudo)) {
        document.getElementById('rua').value = conteudo.logradouro;
        document.getElementById('bairro').value = conteudo.bairro;
        document.getElementById('cidade').value = conteudo.localidade;
        document.getElementById('uf').value = conteudo.uf;
        document.getElementById('ibge').value = conteudo.ibge;
    } else {
        limpa_formulario_cep();
        alert("CEP não encontrado.");
    }
}

function pesquisacep(valor) {
    var cep = valor.replace(/\D/g, '');

    if (cep != "") {
        var validacep = /^[0-9]{8}$/;
        if (validacep.test(cep)) {
            document.getElementById('rua').value = "...";
            document.getElementById('bairro').value = "...";
            document.getElementById('cidade').value = "...";
            document.getElementById('uf').value = "...";
            document.getElementById('ibge').value = "...";

            var script = document.createElement('script');
            script.src = 'https://viacep.com.br/ws/' + cep + '/json/?callback=meu_callback';
            document.body.appendChild(script);
        } else {
            limpa_formulario_cep();
            alert("Formato de CEP inválido.");
        }
    } else {
        limpa_formulario_cep();
    }
}

/* ---------- Salvar local e marcar no mapa ---------- */

function salvarLocal(local) {
    const rua = document.getElementById('rua').value;
    const cidade = document.getElementById('cidade').value;
    const uf = document.getElementById('uf').value;

    if (!cidade || cidade === "...") {
        alert("Informe um CEP válido antes de salvar.");
        return;
    }

    const enderecoCompleto = [rua, cidade, uf, "Brasil"].filter(Boolean).join(", ");
    const url = 'https://nominatim.openstreetmap.org/search?format=json&limit=1&q=' +
                encodeURIComponent(enderecoCompleto);

    fetch(url)
        .then(function (resp) { return resp.json(); })
        .then(function (dados) {
            if (dados.length > 0) {
                colocarLocalSalvo(local, parseFloat(dados[0].lat), parseFloat(dados[0].lon), enderecoCompleto);
            } else {
                alert("Endereço salvo, mas não foi possível localizá-lo no mapa.");
            }
            fecharPopupEndereco();
        })
        .catch(function () {
            alert("Erro ao localizar o endereço no mapa.");
            fecharPopupEndereco();
        });
}

function colocarLocalSalvo(local, lat, lon, endereco) {
    if (locaisSalvos[local]) {
        map.removeLayer(locaisSalvos[local]);
    }

    const emoji = local === "Casa" ? "🏠" : "🏭";

    const popup = document.createElement("div");
    popup.textContent = emoji + " " + local + " · " + endereco;
    locaisSalvos[local] = L.marker([lat, lon]).addTo(map)
        .bindPopup(popup)
        .openPopup();

    map.setView([lat, lon], 16);
}
