// Mock Data: posts ficam em memória até a integração com banco de dados.
const posts = [
  { id: 1, autor: 'Lucas', titulo: 'Batida no cruzamento', categoria: 'acidente', local: 'Avenida Brasil', curtidas: 12 },
  { id: 2, autor: 'Ana', titulo: 'Atenção à aquaplanagem', categoria: 'perigo', local: 'Rodovia Norte', curtidas: 8 },
  { id: 3, autor: 'Eduarda', titulo: 'Cruzamento sem semáforo', categoria: 'trânsito', local: 'Rua Central', curtidas: 21 }
];

function findAll(query) {
  if (!query) return [...posts];
  const term = query.toLowerCase();
  return posts.filter((post) => [post.titulo, post.autor, post.categoria, post.local].some((value) => value.toLowerCase().includes(term)));
}

function create(data) {
  const post = {
    id: posts.length ? Math.max(...posts.map((item) => item.id)) + 1 : 1,
    autor: data.autor || 'Usuário atual',
    titulo: data.titulo,
    categoria: data.categoria || 'outros',
    local: data.local || 'Local não informado',
    curtidas: 0
  };
  posts.push(post);
  return post;
}

module.exports = { findAll, create };
