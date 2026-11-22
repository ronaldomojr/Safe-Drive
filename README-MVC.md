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

Para conferir a publicação, abra o endereço gerado e também `/api/status`, `/api/alertas` e `/api/posts`. A API usa PostgreSQL e cria automaticamente as tabelas `usuarios` e `alertas` na primeira operação. Para criar o administrador inicial em um banco novo, configure ADMIN_INITIAL_PASSWORD.

## Estrutura

```text
api/[...route].js      # entrada Express da Vercel para /api/*
src/app.js             # configuração do Express, CORS e endpoints auxiliares
src/models/            # acesso ao PostgreSQL
src/config/database.js # pool e inicialização do banco
src/routes/alertaRoutes.js
src/controllers/alertaController.js
src/models/alertaModel.js
src/services/          # bcrypt e JWT
src/controllers/       # casos de uso REST de usuários
src/middlewares/       # autenticação Bearer Token
src/routes/            # rotas da API
public/                # páginas, estilos, scripts, imagens e ícones publicados
requests.http          # exemplos para REST Client ou Thunder Client
```

## API de demonstração

Para um banco novo, defina `ADMIN_INITIAL_PASSWORD` para provisionar `admin@safedrive.com`. Em um banco existente, altere a senha pelo painel se a conta ainda usar a antiga senha de demonstração. Configure também `JWT_SECRET`.

- `POST /api/login` autentica e retorna um JWT válido por uma hora.
- `POST /api/usuarios` cadastra um usuário e retorna `201`, sem expor senha.
- `GET /api/usuarios` lista usuários sem expor senha.
- `GET /api/usuarios/:id`, `PUT /api/usuarios/:id` e `DELETE /api/usuarios/:id` exigem `Authorization: Bearer <token>`.
- `GET /api/alertas` lista alertas persistidos com o nome do autor.
- `POST /api/alertas` exige token e vincula o alerta ao usuário autenticado.
- `DELETE /api/alertas/:id` exige token e só permite o autor ou um administrador.
- `GET /api/status` e `GET/POST /api/posts` estão disponíveis. Os posts usam a mesma tabela PostgreSQL dos alertas.

- O painel visual do CRUD está em `/usuarios.html` após login ou cadastro.
- Os usuários são persistidos no PostgreSQL conectado pela variável de ambiente do banco.
- O relacionamento `usuarios (1) -> (N) alertas` usa `alertas.usuario_id` como chave estrangeira para `usuarios.id`, com `ON DELETE CASCADE`.
