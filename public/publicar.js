const form = document.querySelector('#composer');
const statusPost = document.querySelector('#status');
const ponto = document.querySelector('#point');
const preview = document.querySelector('#preview');
const mapa = comunidade.mapa('picker');
let marcador;
let selecao = 0;
let previewUrl;
function marcar(latlng) {
  selecao++;
  const posicao = mapa.wrapLatLng(latlng);
  if (marcador) marcador.setLatLng(posicao);
  else marcador = L.marker(posicao).addTo(mapa);
  ponto.textContent = posicao.lat.toFixed(5) + ', ' + posicao.lng.toFixed(5);
}
mapa.on('click', e => marcar(e.latlng));
document.querySelector('#center').onclick = () => marcar(mapa.getCenter());
document.querySelector('#gps').onclick = () => {
  if (!navigator.geolocation) {
    ponto.textContent = 'GPS indisponível. Marque o ponto no mapa.';
    return;
  }
  const pedido = ++selecao;
  ponto.textContent = 'Buscando sua localização…';
  navigator.geolocation.getCurrentPosition(({ coords }) => {
    if (pedido !== selecao) return;
    const local = L.latLng(coords.latitude, coords.longitude);
    mapa.setView(local, 16);
    marcar(local);
  }, () => {
    if (pedido === selecao) ponto.textContent = 'GPS indisponível. Confirme o ponto no mapa.';
  }, { enableHighAccuracy: true, timeout: 12000 });
};
form.elements.imagem.onchange = () => {
  if (previewUrl) URL.revokeObjectURL(previewUrl);
  const file = form.elements.imagem.files[0];
  preview.hidden = !file;
  if (file) {
    previewUrl = URL.createObjectURL(file);
    preview.src = previewUrl;
  }
};
async function prepararFoto(file) {
  if (!file) return null;
  if (!['image/jpeg','image/png','image/webp'].includes(file.type) || file.size > 20 * 1024 * 1024) {
    throw new Error('Escolha uma imagem JPG, PNG ou WebP de até 20 MB.');
  }
  const imagem = new Image();
  imagem.src = previewUrl;
  try { await imagem.decode(); } catch { throw new Error('Não foi possível ler a foto. Escolha outra imagem.'); }
  const canvas = document.createElement('canvas');
  for (const limite of [1280, 960, 640, 480]) {
    const escala = Math.min(1, limite / Math.max(imagem.width, imagem.height));
    canvas.width = Math.max(1, Math.round(imagem.width * escala));
    canvas.height = Math.max(1, Math.round(imagem.height * escala));
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(imagem, 0, 0, canvas.width, canvas.height);
    const foto = canvas.toDataURL('image/jpeg', 0.75).split(',')[1];
    if (foto.length <= 349524) return foto;
  }
  throw new Error('A foto ficou muito grande. Escolha outra imagem.');
}
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
        foto: await prepararFoto(form.elements.imagem.files[0])
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
