# Safe Drive — arquitetura MVC

## Executar

Requer Node.js 24 ou superior. Não há dependências externas para instalar.

```bash
npm start
```

Abra `http://localhost:3000/mvc`.

## Deploy na Vercel

Importe a raiz do repositório como projeto na Vercel. Não é necessário configurar comando de build nem diretório de saída: os HTML, CSS, JavaScript, imagens e ícones na raiz são publicados como arquivos estáticos. O `vercel.json` cria URLs amigáveis para as páginas e encaminha apenas `/mvc`, `/api`, `/api/alertas`, `/api/posts`, `/alertas` e `/posts` para a função `api/index.js`. O `server.js` continua sendo usado no ambiente local. A versão do Node está fixada em `24.x`.

## Estrutura

```text
server.js              # inicialização do servidor HTTP
routes/                # roteamento e entrega de arquivos estáticos
controllers/           # entrada HTTP, validação e coordenação dos casos de uso
models/                # mock data e operações sobre os dados
views/                 # geração da apresentação HTML
public/                # ponto reservado para assets públicos da nova aplicação
*.html, *.css, *.js    # protótipo legado, preservado durante a migração
```

## API de demonstração

- Rotas de View: `GET /login`, `GET /cadastro`, `GET /central`, `GET /comunidade`, `GET /mapa`, `GET /procurar`, `GET /notificacoes`, `GET /perfil` e `GET /posts/novo`.
- `GET /alertas` lista alertas em memória; `GET /alertas?tipo=acidente` filtra por tipo.
- `POST /alertas` cria um alerta em memória. Envie JSON ou formulário com `tipo`, `titulo`, `local`, `latitude` e `longitude`.
- `GET /posts` lista posts; `GET /posts?q=termo` pesquisa posts.
- `POST /posts` cria um post em memória. O campo obrigatório é `titulo`.
- As rotas `/api/alertas` e `/api/posts` permanecem como aliases compatíveis.

Os dados são reiniciados quando o servidor é reiniciado. A substituição dos Models por um repositório/banco pode ser feita sem mover a lógica para as Views.
