# Safe Drive — arquitetura MVC

## Executar

Requer Node.js 24.x e PostgreSQL configurado em `DATABASE_URL`, `STORAGE_URL` ou `POSTGRES_URL`.

Para executar localmente:

```bash
npm install
npm start
```

Abra `http://localhost:3000`. Para reproduzir localmente o roteamento da Vercel, instale o CLI uma vez e use:

```bash
npm install --global vercel
npm run vercel:dev
```

## Deploy na Vercel

1. Envie este repositório para o GitHub, GitLab ou Bitbucket.
2. Entre em [vercel.com/new](https://vercel.com/new), importe o repositório e selecione a pasta raiz como diretório do projeto.
3. Mantenha o preset como **Other**. Não configure comando de build nem diretório de saída.
4. Clique em **Deploy**. Ao concluir, a Vercel exibirá o endereço público `https://<nome-do-projeto>.vercel.app`.

Os HTML, CSS, JavaScript, imagens e ícones são publicados pelo diretório `public/`. A Vercel entrega esses arquivos pela CDN e encaminha apenas `/api/*` para a função Express `api/[...route].js`. O `package.json` fixa Node.js em `24.x`, versão aceita pela Vercel.

Para conferir a publicação, abra o endereço gerado e também `/api`, `/api/alertas` e `/api/posts`. A API usa PostgreSQL e cria automaticamente a tabela `usuarios` e o administrador inicial na primeira operação.

## Estrutura

```text
api/[...route].js      # entrada Express da Vercel para /api/*
src/app.js             # configuração do Express, CORS e endpoints auxiliares
src/models/            # acesso ao PostgreSQL
src/config/database.js # pool e inicialização do banco
src/services/          # bcrypt e JWT
src/controllers/       # casos de uso REST de usuários
src/middlewares/       # autenticação Bearer Token
src/routes/            # rotas da API
public/                # páginas, estilos, scripts, imagens e ícones publicados
requests.http          # exemplos para REST Client ou Thunder Client
```

## API de demonstração

O administrador inicial é `admin@safedrive.com` com a senha `Admin@123`. A senha está armazenada apenas como hash bcrypt. Defina `JWT_SECRET` nas variáveis de ambiente da Vercel para trocar a chave padrão de desenvolvimento.

- `POST /api/login` autentica e retorna um JWT válido por uma hora.
- `POST /api/usuarios` cadastra um usuário e retorna `201`, sem expor senha.
- `GET /api/usuarios` lista usuários sem expor senha.
- `GET /api/usuarios/:id`, `PUT /api/usuarios/:id` e `DELETE /api/usuarios/:id` exigem `Authorization: Bearer <token>`.
- `GET /api/status`, `GET/POST /api/alertas` e `GET/POST /api/posts` permanecem disponíveis para demonstração.

- O painel visual do CRUD está em `/usuarios.html` após login ou cadastro.
- Os usuários são persistidos no PostgreSQL conectado pela variável de ambiente do banco.
