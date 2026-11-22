const form = document.querySelector('#composer');
const statusPost = document.querySelector('#status');
const ponto = document.querySelector('#point');
const preview = document.querySelector('#preview');
const mapa = comunidade.mapa('picker');
let marcador;
const confirmar = document.querySelector('#confirmarGps');
let estimativa;
let previewUrl;
let referenciaDaBusca = '';
function marcar(latlng) {
  if (referenciaDaBusca && form.elements.referencia.value === referenciaDaBusca) form.elements.referencia.value = '';
  referenciaDaBusca = '';
  limparGps();
  confirmar.hidden = true;
  estimativa = null;
  const posicao = mapa.wrapLatLng(latlng);
  if (marcador) marcador.setLatLng(posicao);
  else marcador = L.marker(posicao).addTo(mapa);
  ponto.textContent = posicao.lat.toFixed(5) + ', ' + posicao.lng.toFixed(5);
}
mapa.on('click', e => marcar(e.latlng));
document.querySelector('#center').onclick = () => {
  if (mapa.getZoom() < 14) {
    ponto.textContent = 'Aproxime o mapa até enxergar a rua antes de marcar o centro.';
    return;
  }
  marcar(mapa.getCenter());
};
const limparGps = controleLocalizacao(mapa, document.querySelector('#gps'), ponto, (posicao, precisao) => {
  marcador?.remove();
  marcador = null;
  estimativa = posicao;
  confirmar.hidden = !posicao || precisao > 100;
  if (posicao && precisao > 100) ponto.textContent += ' Toque na rua correta para marcar a ocorrência.';
});
confirmar.onclick = () => { if (estimativa) marcar(estimativa); };
form.elements.imagem.onchange = () => {
  if (previewUrl) URL.revokeObjectURL(previewUrl);
  const file = form.elements.imagem.files[0];
  preview.hidden = !file;
  if (file) {
    previewUrl = URL.createObjectURL(file);
    preview.src = previewUrl;
  }
};
function pedirLogin() {
  document.querySelector('#login').hidden = false;
  document.querySelector('#fields').disabled = true;
}
if (!sessao) pedirLogin();
form.onsubmit = async event => {
  event.preventDefault();
  if (!marcador) {
    statusPost.textContent = 'Marque o local da ocorrência antes de publicar.';
    return;
  }
  const dados = new FormData(form);
  const { lat, lng } = marcador.getLatLng();
  const fields = document.querySelector('#fields');
  fields.disabled = true;
  statusPost.textContent = 'Publicando…';
  try {
    const r = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + sessao },
      body: JSON.stringify({
        titulo: dados.get('titulo').trim(), categoria: dados.get('categoria'),
        descricao: dados.get('descricao').trim(), latitude: lat, longitude: lng,
        localizacao: dados.get('referencia').trim() || lat.toFixed(5) + ', ' + lng.toFixed(5),
        foto: await prepararFoto(form.elements.imagem.files[0], previewUrl)
      })
    });
    if (r.status === 401 || r.status === 403) {
      pedirLogin();
      throw new Error('Sua sessão expirou. Entre novamente para publicar.');
    }
    const resposta = await r.json();
    if (!r.ok) throw new Error(resposta.erro || 'Falha ao publicar.');
    location.assign('central.html#post-' + resposta.data.id);
  } catch (erro) {
    statusPost.textContent = erro.message || 'Falha ao publicar.';
    if (document.querySelector('#login').hidden) fields.disabled = false;
  }
};

buscaEndereco(document.querySelector('#enderecoPost'), document.querySelector('#buscarPost'),
  document.querySelector('#resultadosPost'), mapa, (local, nome) => {
    mapa.setView(local, 17);
    marcar(local);
    referenciaDaBusca = nome.slice(0, 200);
    form.elements.referencia.value = referenciaDaBusca;
  });
