function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
}

function layout(title, content) {
  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)} | Safe Drive MVC</title>
    <style>
      :root { font-family: system-ui, sans-serif; color: #18324a; background: #f5f8fb; }
      body { margin: 0; } header { background: #123b5d; color: white; padding: 1rem 5vw; display: flex; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
      nav { display: flex; gap: 1rem; } nav a { color: white; } main { max-width: 1000px; margin: 0 auto; padding: 2rem 5vw; }
      .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 1rem; } .card { background: white; border-radius: 10px; padding: 1rem; box-shadow: 0 2px 10px #18324a18; }
      .tag { display: inline-block; background: #e5f2ff; border-radius: 999px; padding: .25rem .6rem; font-size: .85rem; } code { background: #edf1f5; padding: .15rem .3rem; }
    </style>
  </head>
  <body><header><strong>Safe Drive</strong><nav><a href="/mvc">MVC</a><a href="/">Arquivos legados</a><a href="/api/alertas">API de alertas</a><a href="/api/posts">API de posts</a></nav></header>${content}</body>
</html>`;
}

module.exports = { escapeHtml, layout };
