# Safe Drive — arquitetura MVC

## Executar

Requer Node.js 24.x. Não há dependências de aplicação para instalar.

```bash
npm start
```

Abra `http://localhost:3000/` ou `http://localhost:3000/mvc`.

Para reproduzir localmente o roteamento da Vercel, instale o CLI uma vez e use:

```bash
npm install --global vercel
npm run vercel:dev
```

## Deploy na Vercel

1. Envie este repositório para o GitHub, GitLab ou Bitbucket.
2. Entre em [vercel.com/new](https://vercel.com/new), importe o repositório e selecione a pasta raiz como diretório do projeto.
3. Mantenha o preset como **Other**. Não configure comando de build nem diretório de saída.
4. Clique em **Deploy**. Ao concluir, a Vercel exibirá o endereço público `https://<nome-do-projeto>.vercel.app`.

Os HTML, CSS, JavaScript, imagens e ícones são publicados como arquivos estáticos. As URLs amigáveis de páginas e API são configuradas em `vercel.json`; a função Node.js em `api/index.js` encaminha as chamadas para o mesmo roteador usado pelo servidor local (`server.js`). O `package.json` fixa Node.js em `24.x`, versão aceita pela Vercel.

Para conferir a publicação, abra o endereço gerado e também `/api`, `/api/alertas` e `/api/posts`. A API e os Models deste protótipo armazenam dados em memória; gravações não são persistidas entre execuções de funções ou novos deploys. Para uso real, conecte os Models a um banco de dados hospedado.

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
