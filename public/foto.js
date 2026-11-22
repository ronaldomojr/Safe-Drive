async function prepararFoto(file, url, limites = [1280, 960, 640, 480]) {
  if (!file) return null;
  if (!['image/jpeg','image/png','image/webp'].includes(file.type) || file.size > 20 * 1024 * 1024) {
    throw new Error('Escolha uma imagem JPG, PNG ou WebP de até 20 MB.');
  }
  const imagem = new Image();
  imagem.src = url;
  try { await imagem.decode(); } catch { throw new Error('Não foi possível ler a foto. Escolha outra imagem.'); }
  const canvas = document.createElement('canvas');
  for (const limite of limites) {
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
