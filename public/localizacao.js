// A área azul representa a incerteza informada pelo dispositivo.
function controleLocalizacao(mapa, botao, aviso, aoEstimar) {
  let cancelarBusca;
  let camada;
  function limpar() {
    cancelarBusca?.();
    cancelarBusca = null;
    camada?.remove();
    camada = null;
  }
  botao.onclick = () => {
    limpar();
    aoEstimar?.(null);
    if (!navigator.geolocation) {
      aviso.textContent = 'Localização indisponível neste navegador.';
      return;
    }
    aviso.textContent = 'Buscando uma leitura atual do dispositivo…';
    let ativo = true;
    let melhor;
    let watch;
    let timer;
    cancelarBusca = () => {
      ativo = false;
      clearTimeout(timer);
      if (watch !== undefined) navigator.geolocation.clearWatch(watch);
    };
    function finalizar() {
      if (!ativo) return;
      cancelarBusca();
      if (!melhor) {
        aviso.textContent = 'Sem leitura recente. Tente novamente ou escolha o local no mapa.';
        return;
      }
      const { latitude, longitude, accuracy } = melhor;
      const ponto = L.latLng(latitude, longitude);
      const raio = L.circle(ponto, { radius: Math.max(accuracy, 1), color: '#1664ba', weight: 2, fillOpacity: .12 });
      camada = L.layerGroup([raio, L.circleMarker(ponto, {
        radius: 6, color: '#fff', fillColor: '#1664ba', weight: 2, fillOpacity: 1
      })]).addTo(mapa);
      mapa.fitBounds(raio.getBounds(), { maxZoom: 17, padding: [24, 24], animate: false });
      const medida = accuracy >= 1000 ? (accuracy / 1000).toLocaleString('pt-BR', {maximumFractionDigits:1}) + ' km' : Math.ceil(accuracy) + ' m';
      aviso.textContent = 'Precisão estimada: ' + medida + '. ' + (accuracy > 100 ? 'Área ampla. Confira o local no mapa.' : 'Confira o ponto azul no mapa.');
      aoEstimar?.(ponto, accuracy);
    }
    timer = setTimeout(finalizar, 12000);
    watch = navigator.geolocation.watchPosition(leitura => {
      if (!ativo || Date.now() - leitura.timestamp > 30000) return;
      const c = leitura.coords;
      if (![c.accuracy, c.latitude, c.longitude].every(Number.isFinite) || c.accuracy < 0) return;
      if (!melhor || c.accuracy < melhor.accuracy) melhor = c;
      if (melhor.accuracy <= 50) finalizar();
      else aviso.textContent = 'Leitura aproximada. Buscando melhor precisão…';
    }, erro => {
      if (!ativo) return;
      if (erro.code === 1) {
        cancelarBusca();
        aviso.textContent = 'Permita o acesso à localização no navegador ou escolha um ponto no mapa.';
      } else if (erro.code === 3) finalizar();
    }, { enableHighAccuracy: true, maximumAge: 0, timeout: 12000 });
  };
  window.addEventListener('pagehide', limpar);
  return limpar;
}
