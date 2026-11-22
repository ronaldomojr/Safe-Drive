const porId = id => document.getElementById(id);
const painelRota = porId('planejador');
const avisoRota = porId('rotaAviso');
const pontosRota = {};
const pinosRota = {};
const limparBusca = {};
let escolhaMapa, estimativaGps, linhaRota, viagem, consulta = 0;
let acompanhamento = null, pontoMovel, ultimoRecalculo, desvios = 0, revisando = false;

let ultimaFala = '';
const vozRota = porId('vozRota');
porId('vozOpcao').hidden = !('speechSynthesis' in window && 'SpeechSynthesisUtterance' in window);
function orientar(texto) {
  avisoRota.textContent = texto;
  if (vozRota.checked && texto !== ultimaFala) {
    ultimaFala = texto;
    speechSynthesis.cancel();
    const fala = new SpeechSynthesisUtterance(texto);
    fala.lang = 'pt-BR';
    speechSynthesis.speak(fala);
  }
}
vozRota.onchange = () => {
  ultimaFala = '';
  if (!vozRota.checked) window.speechSynthesis?.cancel();
};
function pararNavegacao() {
  ultimaFala = '';
  if (vozRota.checked) window.speechSynthesis?.cancel();
  if (acompanhamento !== null) navigator.geolocation.clearWatch(acompanhamento);
  acompanhamento = null;
  pontoMovel?.remove();
  pontoMovel = null;
  porId('navegar').textContent = 'Iniciar navegação';
}
function invalidarRota() {
  consulta++;
  pararNavegacao();
  linhaRota?.remove();
  linhaRota = null;
  viagem = null;
  revisando = false;
  avisoRota.textContent = '';
  porId('viagem').hidden = true;
}
function definirPonto(campo, ponto, nome) {
  pararGpsMapa();
  invalidarRota();
  escolhaMapa = null;
  limparBusca[campo]?.();
  porId(campo).value = nome;
  pontosRota[campo] = ponto;
  pinosRota[campo]?.remove();
  pinosRota[campo] = L.marker(ponto, {title:nome, icon:L.divIcon({
    className:'pino-rota ' + campo, html:campo === 'origem' ? 'A' : 'B', iconSize:[26,26], iconAnchor:[13,13]
  })}).addTo(map);
}
for (const campo of ['origem', 'destino']) {
  const sufixo = campo === 'origem' ? 'Origem' : 'Destino';
  limparBusca[campo] = buscaEndereco(porId(campo), porId('buscar' + sufixo), porId('res' + sufixo), map, (p, nome) => {
    definirPonto(campo, p, nome);
    map.setView(p, 16);
  });
  porId(campo).addEventListener('input', () => {
    invalidarRota();
    escolhaMapa = null;
    delete pontosRota[campo];
    pinosRota[campo]?.remove();
  });
  porId('marcar' + sufixo).onclick = () => {
    pararGpsMapa();
    escolhaMapa = campo;
    painelRota.open = false;
    porId('planejador').querySelector('summary').textContent = campo === 'origem' ? 'Toque na partida no mapa' : 'Toque no destino no mapa';
  };
}
map.on('click', e => {
  if (!escolhaMapa) return;
  const campo = escolhaMapa;
  definirPonto(campo, e.latlng, campo === 'origem' ? 'Partida marcada no mapa' : 'Destino marcado no mapa');
  painelRota.open = true;
  painelRota.querySelector('summary').textContent = 'Para onde você está indo?';
});
painelRota.addEventListener('toggle', () => {
  if (painelRota.open) { escolhaMapa = null; painelRota.querySelector('summary').textContent = 'Para onde você está indo?'; }
});
function destinoPost(post) {
  definirPonto('destino', L.latLng(post.latitude, post.longitude), post.titulo);
  painelRota.open = true;
}
function origemGps(ponto, precisao) {
  estimativaGps = ponto;
  porId('usarGps').hidden = !ponto || precisao > 100;
  if (ponto && precisao > 100) porId('posicaoMapa').append(' Marque a partida na rua correta.');
}
porId('usarGps').onclick = () => {
  if (estimativaGps) definirPonto('origem', estimativaGps, 'Localização confirmada');
  porId('usarGps').hidden = true;
};

// O Valhalla entrega a geometria como polyline com seis casas decimais.
function decodificarLinha(texto) {
  const pontos = [];
  let i = 0, lat = 0, lon = 0;
  function delta() {
    let soma = 0, deslocamento = 0, valor;
    do {
      if (i >= texto.length || deslocamento > 30) throw new Error('Geometria inválida.');
      valor = texto.charCodeAt(i++) - 63;
      soma |= (valor & 31) << deslocamento;
      deslocamento += 5;
    } while (valor >= 32);
    return soma & 1 ? ~(soma >> 1) : soma >> 1;
  }
  while (i < texto.length) {
    lat += delta(); lon += delta();
    pontos.push(L.latLng(lat / 1e6, lon / 1e6));
  }
  return pontos;
}
async function calcular(partida, recalculo = false) {
  const destino = pontosRota.destino;
  if (!partida || !destino) { avisoRota.textContent = 'Selecione uma partida e um destino nos resultados ou no mapa.'; return; }
  if (partida.distanceTo(destino) < 15) { avisoRota.textContent = 'Escolha pontos de partida e destino diferentes.'; return; }
  if (!recalculo) invalidarRota();
  const pedido = ++consulta;
  avisoRota.textContent = recalculo ? 'Recalculando o trajeto…' : 'Calculando pelas vias…';
  try {
    const params = {locations:[partida, destino].map(p => ({lat:p.lat,lon:p.lng})), costing:'auto',
      directions_options:{units:'kilometers', language:'pt-BR'}, shape_format:'polyline6'};
    const r = await fetch('https://valhalla1.openstreetmap.de/route?json=' + encodeURIComponent(JSON.stringify(params)), {signal:AbortSignal.timeout(18000)});
    if (!r.ok) throw new Error();
    const {trip} = await r.json();
    if (pedido !== consulta) return;
    const leg = trip.legs[0];
    const pontos = decodificarLinha(leg.shape);
    if (pontos.length < 2 || !leg.maneuvers.length) throw new Error();
    viagem = {pontos, manobras:leg.maneuvers};
    linhaRota?.remove();
    linhaRota = L.polyline(pontos, {color:'#1862bb',weight:6,opacity:.9}).addTo(map);
    if (!recalculo) {
      const painel = document.querySelector('.map-panel').getBoundingClientRect();
      const mobile = matchMedia('(max-width:767px)').matches;
      const largura = map.getSize().x;
      const direita = document.querySelector('.floating-posts-container').offsetWidth;
      map.fitBounds(linhaRota.getBounds(), {
        paddingTopLeft:mobile ? [16,Math.min(painel.height+16,map.getSize().y*.4)] : [Math.min(painel.width+32,largura*.3),30],
        paddingBottomRight:mobile ? [16,80] : [Math.min(direita+24,largura*.33),32],maxZoom:16
      });
    }
    porId('estimativa').textContent = Math.max(1,Math.round(trip.summary.time / 60)) + ' min · ' + trip.summary.length.toLocaleString('pt-BR',{maximumFractionDigits:1}) + ' km';
    porId('manobras').replaceChildren(...leg.maneuvers.map(m => comunidade.elemento('li',m.instruction)));
    porId('viagem').hidden = false;
    avisoRota.textContent = recalculo ? 'Trajeto recalculado.' : '';
  } catch {
    if (pedido === consulta) avisoRota.textContent = 'Não foi possível calcular o trajeto. Confira se os pontos ficam em ruas acessíveis e tente novamente.';
  } finally { if (pedido === consulta) revisando = false; }
}
porId('calcular').onclick = () => calcular(pontosRota.origem);
porId('encerrar').onclick = () => {
  invalidarRota();
  for (const campo of ['origem','destino']) {
    pinosRota[campo]?.remove(); delete pontosRota[campo]; porId(campo).value = ''; limparBusca[campo]();
  }
};
porId('navegar').onclick = () => {
  if (acompanhamento !== null) { consulta++; revisando = false; pararNavegacao(); avisoRota.textContent = 'Navegação encerrada.'; return; }
  if (!navigator.geolocation || !viagem) { avisoRota.textContent = 'GPS indisponível.'; return; }
  pararGpsMapa();
  desvios = 0; ultimoRecalculo = 0;
  porId('navegar').textContent = 'Parar navegação';
  avisoRota.textContent = 'Aguardando sua posição na rota…';
  acompanhamento = navigator.geolocation.watchPosition(({coords,timestamp}) => {
    if (acompanhamento === null || !viagem) return;
    if (Date.now()-timestamp > 30000 || coords.accuracy > 100) { avisoRota.textContent = 'Aguardando GPS com melhor precisão…'; return; }
    const p = L.latLng(coords.latitude,coords.longitude);
    // Não deslocar a viagem para outra cidade por causa de uma leitura incompatível.
    const anterior = pontoMovel?.getLatLng() || pontosRota.origem;
    if (p.distanceTo(anterior) > 5000) { avisoRota.textContent = 'GPS distante da partida ou da última posição. Confira a localização do aparelho.'; return; }
    if (!pontoMovel) pontoMovel = L.circleMarker(p,{radius:8,color:'#fff',fillColor:'#1559b4',fillOpacity:1}).addTo(map);
    pontoMovel.setLatLng(p); map.setView(p,17,{animate:false});
    if (p.distanceTo(pontosRota.destino) < 30) { pararNavegacao(); orientar('Você chegou ao destino.'); return; }
    const atual = map.project(p,16);
    let menor = Infinity, indice = 0;
    for (let i=1;i<viagem.pontos.length;i++) {
      const proximo = L.LineUtil.closestPointOnSegment(atual,map.project(viagem.pontos[i-1],16),map.project(viagem.pontos[i],16));
      const metros = p.distanceTo(map.unproject(proximo,16));
      if (metros < menor) { menor = metros; indice = i-1; }
    }
    desvios = menor > Math.max(65,coords.accuracy*2) ? desvios+1 : 0;
    if (desvios >= 2 && !revisando && Date.now()-ultimoRecalculo > 30000) {
      revisando = true; ultimoRecalculo = Date.now(); desvios = 0; calcular(p,true); return;
    }
    if (!revisando) {
      const seguinte = viagem.manobras.find(m => m.begin_shape_index > indice);
      orientar(seguinte ? 'A seguir: ' + seguinte.instruction : 'Continue até o destino.');
    }
  }, erro => {
    if (erro.code === 1) pararNavegacao();
    avisoRota.textContent = 'GPS indisponível. As instruções do trajeto continuam na lista.';
  }, {enableHighAccuracy:true,maximumAge:0,timeout:15000});
};
window.addEventListener('pagehide', pararNavegacao);
