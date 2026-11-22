function lerJPEG(foto) {
  if (foto != null) {
    if (typeof foto !== 'string' || foto.length > 349528 || !/^[A-Za-z0-9+/]+={0,2}$/.test(foto)) {
      throw new Error('Envie uma foto JPEG de até 256 KiB.');
    }
    const imagem = Buffer.from(foto, 'base64');
    if (imagem.length > 262144 || imagem.length < 4 ||
        imagem.readUIntBE(0, 3) !== 0xffd8ff || imagem.readUInt16BE(imagem.length - 2) !== 0xffd9) {
      throw new Error('Foto JPEG inválida.');
    }
    return imagem;
  }
  return null;
}

module.exports = { lerJPEG };
