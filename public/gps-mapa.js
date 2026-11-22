const botaoGps = document.querySelector('#gpsMapa');
const avisoGps = document.querySelector('#posicaoMapa');
let observacaoGps = null;
let geracaoGps = 0;
let circuloGps, marcadorGps, ultimaPosicaoGps;
function pararGpsMapa() {
  geracaoGps++;
  if (observacaoGps !== null) navigator.geolocation.clearWatch(observacaoGps);
  observacaoGps = null;
  circuloGps?.remove();
  marcadorGps?.remove();
  circuloGps = marcadorGps = ultimaPosicaoGps = null;
  origemGps(null);
  botaoGps.textContent = '◎ Minha localização';
  botaoGps.setAttribute('aria-pressed', 'false');
  avisoGps.replaceChildren();
}
function iniciarGpsMapa() {
  pararGpsMapa();
  if (!navigator.geolocation) { avisoGps.textContent = 'GPS indisponível neste navegador.'; return; }
  if (acompanhamento !== null) pararNavegacao();
  const geracao = geracaoGps;
  let base = map.getCenter();
  let distante = null;
  let primeiro = true;
  const ver = document.createElement('button');
  ver.type = 'button';
  ver.textContent = 'Conferir ponto distante';
  function mostrar(p, precisao) {
    base = p;
    distante = null;
    ultimaPosicaoGps = p;
    if (!marcadorGps) {
      circuloGps = L.circle(p, {radius:Math.max(precisao,1),color:'#216abc',weight:1,fillOpacity:.12,interactive:false}).addTo(map);
      marcadorGps = L.circleMarker(p,{radius:7,color:'#fff',weight:2,fillColor:'#1767b3',fillOpacity:1}).addTo(map);
      marcadorGps.bindTooltip('Posição do aparelho');
    } else {
      marcadorGps.setLatLng(p);
      circuloGps.setLatLng(p).setRadius(Math.max(precisao,1));
    }
    const margem = Math.ceil(precisao);
    avisoGps.textContent = 'GPS ativo · margem estimada de ' + margem + ' m.';
    origemGps(p,precisao);
    if (primeiro) map.setView(p, precisao > 500 ? 14 : 17, {animate:false});
    else map.panTo(p,{animate:false});
    primeiro = false;
  }
  ver.onclick = () => { if (distante && geracao === geracaoGps) mostrar(distante.p,distante.precisao); };
  botaoGps.setAttribute('aria-pressed','true');
  botaoGps.textContent = 'Parar GPS';
  avisoGps.textContent = 'Aguardando o aparelho…';
  observacaoGps = navigator.geolocation.watchPosition(({coords,timestamp}) => {
    if (geracao !== geracaoGps || Date.now()-timestamp > 30000) return;
    const { latitude, longitude, accuracy } = coords;
    if (![latitude,longitude,accuracy].every(Number.isFinite) || accuracy < 0) return;
    const p = L.latLng(latitude,longitude);
    if (p.distanceTo(base) > 40000) {
      distante = {p,precisao:accuracy};
      origemGps(null);
      avisoGps.replaceChildren('O aparelho informou uma posição distante da região exibida. ',ver);
      return;
    }
    mostrar(p,accuracy);
  }, erro => {
    if (geracao !== geracaoGps) return;
    if (erro.code === 1) { pararGpsMapa(); avisoGps.textContent = 'Permita a localização nas configurações do navegador para usar o GPS.'; }
    else avisoGps.textContent = marcadorGps ? 'Sem sinal recente. Exibindo a última posição recebida.' : 'Aguardando sinal de localização…';
  }, {enableHighAccuracy:true,maximumAge:0,timeout:15000});
}
botaoGps.onclick = () => { if (observacaoGps === null) iniciarGpsMapa(); else pararGpsMapa(); };
window.addEventListener('pagehide', pararGpsMapa);
