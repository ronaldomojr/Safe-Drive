# Safe Drive — arquitetura MVC

## Executar

Requer Node.js 24.x. Não há dependências de aplicação para instalar.

Para executar localmente com o mesmo roteamento da Vercel, instale o CLI uma vez e use:

```bash
npm install --global vercel
npm run vercel:dev
```

## Deploy na Vercel

1. Envie este repositório para o GitHub, GitLab ou Bitbucket.
2. Entre em [vercel.com/new](https://vercel.com/new), importe o repositório e selecione a pasta raiz como diretório do projeto.
3. Mantenha o preset como **Other**. Não configure comando de build nem diretório de saída.
4. Clique em **Deploy**. Ao concluir, a Vercel exibirá o endereço público `https://<nome-do-projeto>.vercel.app`.

Os HTML, CSS, JavaScript, imagens e ícones são publicados pelo diretório `public/`. As URLs amigáveis e a API são configuradas em `vercel.json`; as funções Node.js ficam separadas em `api/alertas.js`, `api/mvc.js`, `api/posts.js` e `api/status.js`. O `package.json` fixa Node.js em `24.x`, versão aceita pela Vercel.

Para conferir a publicação, abra o endereço gerado e também `/api`, `/api/alertas` e `/api/posts`. A API e os Models deste protótipo armazenam dados em memória; gravações não são persistidas entre execuções de funções ou novos deploys. Para uso real, conecte os Models a um banco de dados hospedado.

## Estrutura

```text
api/                   # funções serverless da Vercel
controllers/           # validação e coordenação dos casos de uso
models/                # mock data e operações sobre os dados
views/                 # geração da apresentação HTML da rota /mvc
public/                # páginas, estilos, scripts, imagens e ícones publicados
```

## API de demonstração

- Rotas de View: `GET /login`, `GET /cadastro`, `GET /central`, `GET /comunidade`, `GET /mapa`, `GET /procurar`, `GET /notificacoes`, `GET /perfil` e `GET /posts/novo`.
- `GET /alertas` lista alertas em memória; `GET /alertas?tipo=acidente` filtra por tipo.
- `POST /alertas` cria um alerta em memória. Envie JSON ou formulário com `tipo`, `titulo`, `local`, `latitude` e `longitude`.
- `GET /posts` lista posts; `GET /posts?q=termo` pesquisa posts.
- `POST /posts` cria um post em memória. O campo obrigatório é `titulo`.
- As rotas `/api/alertas` e `/api/posts` permanecem como aliases compatíveis.

Os dados são reiniciados quando o servidor é reiniciado. A substituição dos Models por um repositório/banco pode ser feita sem mover a lógica para as Views.
