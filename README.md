# Safe Drive

Documentação técnica oficial do **Safe Drive**, projeto da disciplina de
Sistemas de Informação (APRO, 2026).

## 1. Visão geral

O Safe Drive é uma plataforma web colaborativa para compartilhamento de
alertas e informações de segurança viária. A aplicação permite autenticação de
usuários, publicação de alertas vinculados ao autor, consulta de ocorrências e
gestão administrativa de usuários.

O projeto resolve a dificuldade de centralizar informações sobre acidentes,
obras, perigos e condições de trânsito em um ambiente acessível pelo navegador.
Seus objetivos são apoiar a comunicação entre motoristas, manter os registros
persistidos e aplicar controle de acesso por perfil.

**Aplicação publicada:** [safe-drive-lemon.vercel.app](https://safe-drive-lemon.vercel.app)

## 2. Tecnologias utilizadas

### Front-end

- HTML5 e CSS3, com páginas estáticas responsivas.
- JavaScript Vanilla para formulários, navegação, consumo da API e manipulação
  do DOM.
- React 18 via CDN na página de criação de posts (`react.html`).
- [ViaCEP](https://viacep.com.br/) para consulta de endereço a partir do CEP.
- [Leaflet](https://leafletjs.com/) e [OpenStreetMap](https://www.openstreetmap.org/)
  para mapas.
- Embeds de conteúdo externo, incluindo vídeos do YouTube.

### Back-end

- Node.js `24.x`.
- Express `5.x`.
- `jsonwebtoken` para emissão e validação de JWT.
- `bcryptjs` para hash e comparação de senhas.
- `cors` para configuração de acesso entre origens.
- `pg` (node-postgres) para conexão com PostgreSQL.

### Banco de dados e infraestrutura

- PostgreSQL hospedado no Neon e conectado pela Vercel Storage.
- Vercel para hospedagem dos arquivos estáticos e execução das Serverless
  Functions da API.

## 3. Arquitetura e padrões aplicados

O front-end publicado está em `public/`. O back-end segue MVC e é exposto
localmente pelo `server.js` e, na Vercel, por `api/[...route].js`.

```text
Safe-Drive/
├── api/
│   └── [...route].js              # Entrada serverless da Vercel
├── public/                        # Arquivos publicados como conteúdo estático
│   ├── index.html                 # Login
│   ├── cadastro.html              # Cadastro público
│   ├── usuarios.html              # Painel administrativo
│   ├── central.html               # Central da comunidade e alertas
│   ├── mapa.html                  # Mapa com Leaflet/OpenStreetMap
│   ├── react.html                 # Formulário de novo post
│   ├── p_safedrive.html           # Página inicial institucional
│   ├── post-1.html ... post-7.html
│   ├── lucas-perfil.html
│   ├── notificacoes.html
│   ├── procurar.html
│   ├── google.html
│   ├── apple.html
│   ├── header.js
│   ├── script.js
│   ├── redirecionamento.js
│   ├── menu-hamburguer.js
│   ├── veracidade.js
│   ├── *.css
│   ├── Imagens/                  # Imagens usadas pelas páginas
│   ├── img/                      # Logos, ícones e imagens adicionais
│   └── favicon*/                 # Ícones e manifestos
├── src/
│   ├── app.js                    # Configuração do Express e rotas auxiliares
│   ├── config/
│   │   └── database.js           # Pool PostgreSQL e inicialização das tabelas
│   ├── models/
│   │   ├── userModel.js          # DAO/Repository de usuários
│   │   └── alertaModel.js        # DAO/Repository de alertas
│   ├── controllers/
│   │   ├── userController.js
│   │   └── alertaController.js
│   ├── services/
│   │   └── authService.js        # Hash, comparação e JWT
│   ├── middlewares/
│   │   └── authMiddleware.js     # Autenticação e autorização
│   └── routes/
│       ├── userRoutes.js
│       └── alertaRoutes.js
├── models/                       # Models legados da demonstração de posts
│   ├── postModel.js              # Posts mantidos em memória
│   └── alertModel.js             # Mock legado não usado pelas rotas atuais
├── server.js                     # Entrada para execução local
├── package.json
├── package-lock.json
├── vercel.json
├── requests.http                 # Exemplos para REST Client
└── README-MVC.md
```

### Padrões

- **MVC:** rotas encaminham requisições para controllers; controllers
  coordenam validações e casos de uso; models encapsulam o acesso ao banco.
- **Service Layer:** `authService.js` concentra hash de senha, comparação,
  geração e validação de tokens JWT.
- **Middleware / Chain of Responsibility:** `autenticarToken` valida o
  `Authorization: Bearer <token>` e `autorizarAdmin` restringe operações
  administrativas antes do controller.
- **Singleton / Connection Pool:** `database.js` cria um único `Pool` por
  instância da função e usa uma Promise compartilhada para inicialização
  idempotente.
- **Repository / DAO:** `userModel.js` e `alertaModel.js` concentram queries
  SQL parametrizadas e não misturam persistência com HTTP.

Na Vercel, `vercel.json` publica `public/` como `outputDirectory` e reescreve
`/api/*` para `api/[...route].js`. Esse entrypoint reutiliza a aplicação
Express de `src/app.js`.

## 4. Modelo de dados PostgreSQL

As tabelas são criadas automaticamente por `initDatabase()` na primeira
operação que acessa o banco.

### `usuarios`

| Campo | Tipo | Restrições |
|---|---|---|
| `id` | `SERIAL` | **PK** |
| `nome` | `VARCHAR(120)` | `NOT NULL` |
| `email` | `VARCHAR(150)` | `UNIQUE`, `NOT NULL` |
| `senha_hash` | `TEXT` | `NOT NULL` |
| `perfil` | `VARCHAR(30)` | `NOT NULL`, `DEFAULT 'usuario'` |
| `criado_em` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` |

Quando `ADMIN_INITIAL_PASSWORD` está configurada, o administrador inicial
`admin@safedrive.com` é inserido com
`ON CONFLICT (email) DO NOTHING`.

### `alertas`

| Campo | Tipo | Restrições |
|---|---|---|
| `id` | `SERIAL` | **PK** |
| `usuario_id` | `INTEGER` | **FK**, `NOT NULL` |
| `titulo` | `VARCHAR(150)` | `NOT NULL` |
| `categoria` | `VARCHAR(50)` | `NOT NULL`, `DEFAULT 'transito'` |
| `descricao` | `TEXT` | `NOT NULL` |
| `cep` | `VARCHAR(10)` | opcional |
| `localizacao` | `VARCHAR(200)` | `NOT NULL` |
| `criado_em` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` |

Relacionamento:

```text
usuarios (1) ──────────── (N) alertas
             alertas.usuario_id
             REFERENCES usuarios(id) ON DELETE CASCADE
```

Ao excluir um usuário, o PostgreSQL exclui automaticamente seus alertas por
causa da restrição `ON DELETE CASCADE`. A listagem de alertas usa `INNER JOIN`
para retornar também `usuarios.nome AS autor_nome`.

## 5. API RESTful

Todas as respostas de erro usam o campo JSON `erro`. O header de autenticação,
quando necessário, tem o formato:

```http
Authorization: Bearer <token>
```

| Método | Rota | Autenticação | Descrição | Status principais |
|---|---|---|---|---|
| `GET` | `/api/status` | Não | Verifica a API e lista os grupos de endpoints. | `200`, `500` |
| `POST` | `/api/usuarios` | Não | Cadastra usuário; senha é convertida em hash. | `201`, `400`, `409`, `500` |
| `POST` | `/api/login` | Não | Valida credenciais e retorna JWT e usuário público. | `200`, `400`, `401`, `500` |
| `GET` | `/api/usuarios` | **Admin** | Lista todos os usuários sem senha. | `200`, `401`, `403`, `500` |
| `GET` | `/api/usuarios/:id` | Token válido | Consulta um usuário por ID. | `200`, `401`, `403`, `404`, `500` |
| `PUT` | `/api/usuarios/:id` | **Admin** | Atualiza nome, e-mail, perfil e, opcionalmente, senha. | `200`, `400`, `401`, `403`, `404`, `409`, `500` |
| `DELETE` | `/api/usuarios/:id` | **Admin** | Exclui usuário e seus alertas relacionados. | `200`, `401`, `403`, `404`, `500` |
| `GET` | `/api/alertas` | Não | Lista alertas com dados do autor, do mais recente ao mais antigo. | `200`, `500` |
| `POST` | `/api/alertas` | Token válido | Cria alerta associado ao usuário do token. | `201`, `400`, `401`, `403`, `500` |
| `DELETE` | `/api/alertas/:id` | Token válido | Exclui alerta se o solicitante for autor ou admin. | `200`, `401`, `403`, `404`, `500` |

Os campos obrigatórios para criar um alerta são `titulo`, `descricao` e
`localizacao`. `categoria` assume `transito` quando omitida; `cep` é opcional.

Exemplos completos de requisições estão em
[requests.http](./requests.http).

A Central e o mapa usam os mesmos posts persistidos na tabela `alertas`.
`GET /api/posts?q=obra` busca ocorrências. `POST /api/posts` exige sessão,
título, descrição, localização e coordenadas numéricas. A foto é opcional:
o navegador a comprime em JPEG de até 256 KiB. A API salva os bytes na mesma
linha e serve a foto em `GET /api/posts/:id/foto`. Alertas antigos continuam
no feed e aparecem no mapa quando possuem coordenadas.

A Vercel serve `public/central.html` (feed), `public/react.html` (publicação)
e `public/mapa.html` (mapa). O GPS requer HTTPS ou localhost e permissão
do navegador. A seleção manual funciona sem essa permissão. O mapa usa
Leaflet com tiles públicos do OpenStreetMap e atualiza os posts a cada minuto
enquanto visível. As fotos consomem a cota do banco Neon.

## 6. Segurança, autenticação e acesso

- Senhas nunca são armazenadas em texto puro. `bcryptjs` gera um hash
  unidirecional com salt, armazenado em `usuarios.senha_hash`.
- A comparação no login é feita com `bcrypt.compare`; o campo
  `senha_hash` não é incluído nas respostas públicas.
- Após o login, `authService.js` emite um JWT com `id`, `email` e `perfil`,
  válido por uma hora.
- Rotas protegidas exigem `Authorization: Bearer <token>`.
- `autenticarToken` retorna `401` quando o header não é informado e `403` quando
  o token é inválido ou expirado.
- `autorizarAdmin` limita listagem, edição e exclusão de usuários ao perfil
  `admin`.
- A exclusão de alertas é limitada ao próprio autor ou a um administrador.
- No front-end, usuários comuns são direcionados para `central.html` e
  administradores para `usuarios.html`. O painel administrativo também
  verifica a sessão e o perfil antes de carregar a lista.
- Configure `JWT_SECRET` tanto localmente quanto na Vercel.

## 7. Execução local e variáveis de ambiente

### Pré-requisitos

- Git.
- Node.js `24.x`.
- Uma instância PostgreSQL acessível, como Neon.

### Instalação

```bash
git clone https://github.com/ronaldomojr/Safe-Drive.git
cd Safe-Drive
npm install
```

Configure as variáveis no ambiente de execução. Um arquivo `.env` local pode
ser usado como referência, mas não deve ser versionado:

```dotenv
DATABASE_URL=postgresql://usuario:senha@host/banco?sslmode=require
JWT_SECRET=uma-chave-secreta-longa
```

O código aceita `DATABASE_URL`, `STORAGE_URL` ou `POSTGRES_URL`, nessa ordem.
Em produção, configure essas variáveis nos ambientes Development, Preview e
Production do projeto Vercel. Para executar localmente com o suporte de
variáveis de ambiente do Node.js:

```bash
node --env-file=.env server.js
```

Ou exporte as variáveis no terminal e use o script padrão:

```bash
npm start
```

A aplicação local fica disponível em <http://localhost:3000>. Para simular o
roteamento da Vercel, use:

```bash
npm run vercel:dev
```

O arquivo [requests.http](./requests.http) contém exemplos de login, CRUD de
usuários e operações de alertas para REST Client ou Thunder Client.

## 8. Deploy

O deploy é acionado ao enviar alterações para a branch `main`. A Vercel:

1. publica `public/` como conteúdo estático;
2. encaminha `/api/*` para `api/[...route].js`;
3. injeta as variáveis de ambiente configuradas;
4. executa a API Express com Node.js `24.x`.

Para produção, mantenha `DATABASE_URL` e `JWT_SECRET` configurados na Vercel
e nunca inclua credenciais no repositório.
