const { escapeHtml, layout } = require('./layout');

function renderHome() {
  return layout('Arquitetura MVC', `<main>
    <h1>Safe Drive — base MVC</h1>
    <p>Servidor executável com Models em memória, Controllers responsáveis pelo fluxo e Views responsáveis pela apresentação.</p>
    <div class="grid">
      <section class="card"><span class="tag">Model</span><h2>Dados simulados</h2><p><code>models/alertModel.js</code> e <code>models/postModel.js</code> isolam arrays e operações de dados.</p></section>
      <section class="card"><span class="tag">Controller</span><h2>Regras de entrada</h2><p><code>controllers/</code> valida requisições e coordena Models e Views.</p></section>
      <section class="card"><span class="tag">View</span><h2>Apresentação</h2><p><code>views/</code> gera HTML sem acessar diretamente os arrays de dados.</p></section>
    </div>
    <h2>Endpoints de demonstração</h2>
    <ul><li><a href="/api/alertas">GET /api/alertas</a></li><li><a href="/api/posts">GET /api/posts</a></li><li><a href="/api/posts?q=acidente">GET /api/posts?q=acidente</a></li></ul>
    <p>Os arquivos HTML/CSS/JS existentes continuam acessíveis pela rota raiz durante a migração.</p>
  </main>`);
}

module.exports = { renderHome, escapeHtml };
