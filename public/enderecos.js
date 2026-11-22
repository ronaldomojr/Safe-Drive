function buscaEndereco(input, botao, lista, mapa, selecionar) {
  let versao = 0;
  function limpar() { versao++; lista.replaceChildren(); }
  input.addEventListener('input', limpar);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); botao.click(); }
  });
  botao.onclick = async () => {
    limpar();
    const pedido = versao;
    const q = input.value.trim();
    if (q.length < 3) { lista.textContent = 'Digite pelo menos três letras.'; return; }
    lista.textContent = 'Buscando endereços…';
    const centro = mapa.getCenter();
    const params = new URLSearchParams({ q, lat: centro.lat, lon: centro.lng, limit: 5 });
    try {
      const r = await fetch('https://photon.komoot.io/api/?' + params, { signal: AbortSignal.timeout(12000) });
      if (!r.ok) throw new Error();
      const dados = await r.json();
      if (pedido !== versao) return;
      lista.replaceChildren();
      for (const item of dados.features) {
        const p = item.properties;
        const nome = [...new Set([p.name, p.street, p.housenumber, p.district, p.city, p.state, p.country].filter(Boolean))].join(', ');
        const [lon, lat] = item.geometry.coordinates;
        const escolha = comunidade.elemento('button', nome);
        escolha.type = 'button';
        escolha.onclick = () => { limpar(); input.value = nome; selecionar(L.latLng(lat, lon), nome); };
        lista.append(escolha);
      }
      if (!lista.childElementCount) lista.textContent = 'Nenhum resultado. Inclua a cidade ou escolha o ponto no mapa.';
    } catch { if (pedido === versao) lista.textContent = 'Busca indisponível. Você pode marcar o ponto no mapa.'; }
  };
  return limpar;
}
