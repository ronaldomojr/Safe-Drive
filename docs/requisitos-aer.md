# AER — Levantamento de Requisitos e Histórias de Usuário

**Produto:** Safe Drive  
**Ticket:** 1 — Levantamento de Requisitos e Histórias de Usuário  
**Data:** 27/09/2026  
**Status:** Baseline para a refatoração

## 1. Objetivo e escopo

O Safe Drive é uma plataforma comunitária de segurança viária. O usuário pode consultar informações de trânsito em um mapa, publicar ocorrências e interagir com a comunidade por meio de posts, comentários, curtidas, compartilhamentos, busca, perfis e notificações.

Este documento consolida o comportamento identificado nas telas atuais do protótipo e define o comportamento esperado para a versão refatorada. As telas existentes são a fonte visual do escopo; as integrações e persistência ainda devem ser implementadas ou confirmadas.

## 2. Evidências das telas atuais

| Área | Tela/arquivo observado | Comportamento representado |
| --- | --- | --- |
| Entrada | `index.html` | Login por e-mail e senha, lembrar acesso, mostrar/ocultar senha e links para cadastro e login social. |
| Cadastro | `cadastro.html` | Nome, e-mail, senha, geração de senha forte, validação de e-mail/senha e confirmação de cadastro. |
| Login social | `google.html`, `apple.html` | Fluxos visuais de autenticação via Google e Apple. |
| Apresentação | `p_safedrive.html` | Proposta do produto, serviços, alertas, notícias, infográficos e atalhos para mapa/comunidade. |
| Mapa | `mapa.html` | Mapa Leaflet/OpenStreetMap, cartões de ocorrências e navegação para detalhes do post. |
| Comunidade | `central.html` | Feed de posts com mídia, autoria, tempo, curtida, comentário, compartilhamento e acesso a novo post. |
| Publicação | `react.html` | Tela de criação de novo post. |
| Detalhe | `post-1.html` a `post-7.html` | Conteúdo da ocorrência, ações sociais e seção de comentários. |
| Busca | `procurar.html` | Busca por postagens, usuários ou palavras-chave, com filtros de posts, usuários e locais. |
| Perfil | `lucas-perfil.html` | Perfil público, seguir, enviar mensagem e grade de posts. |
| Notificações | `notificacoes.html` e drawer da central | Notificações de post, comentário, curtida e novo seguidor, com estado lido/não lido. |

## 3. Atores

- **Visitante:** acessa a apresentação, login e cadastro; pode visualizar áreas públicas conforme a política de acesso.
- **Usuário autenticado/motorista:** consulta o mapa e o feed, publica ocorrências e interage com a comunidade.
- **Autor da publicação:** usuário autenticado que pode consultar e administrar as próprias publicações.
- **Moderador/administrador:** papel previsto para análise de denúncias, conteúdo inadequado e manutenção de dados, mesmo que ainda não exista uma tela correspondente no protótipo.
- **Serviços externos:** provedor de mapas/geocodificação e provedores de identidade Google/Apple.

## 4. Requisitos funcionais

### RF-01 — Acesso e autenticação

1. O sistema deve permitir que o visitante informe e-mail e senha para entrar.
2. O sistema deve permitir mostrar e ocultar a senha sem alterar seu valor.
3. O sistema deve oferecer a opção de lembrar a sessão somente com consentimento explícito do usuário.
4. O sistema deve informar validações e falhas de autenticação sem revelar se um e-mail está cadastrado.
5. O sistema deve permitir iniciar autenticação por Google e Apple quando os provedores estiverem configurados.
6. O sistema deve permitir encerrar a sessão e retornar o usuário a uma área pública.

### RF-02 — Cadastro e conta

1. O sistema deve permitir cadastro com nome, e-mail e senha.
2. O e-mail deve ser validado quanto ao formato e à unicidade.
3. A senha deve respeitar, no mínimo, 8 caracteres, letra maiúscula, número e caractere especial, conforme a tela atual.
4. O sistema deve disponibilizar geração de senha forte e controle de visibilidade da senha.
5. Campos obrigatórios e erros devem ser apresentados próximos ao campo e em linguagem compreensível.
6. Após cadastro válido, o usuário deve receber confirmação e ser encaminhado ao login ou à sessão autenticada.
7. O usuário deve poder solicitar recuperação de acesso por fluxo próprio, sem expor dados da conta.

### RF-03 — Navegação e apresentação

1. O sistema deve disponibilizar navegação consistente para página inicial, mapa ao vivo, comunidade, perfil, busca, notificações e entrada.
2. O menu deve funcionar em desktop e em dispositivos móveis, incluindo abertura e fechamento por teclado.
3. A página inicial deve apresentar o propósito da plataforma, alertas em tempo real, notícias locais, infográficos e atalhos para mapa e comunidade.
4. O sistema deve manter o contexto de navegação ao abrir um post ou perfil e oferecer retorno à tela anterior/central.

### RF-04 — Mapa e alertas geolocalizados

1. O sistema deve renderizar um mapa navegável com a biblioteca de mapas definida para o produto.
2. O sistema deve exibir marcadores de ocorrências com categoria, localização e status/tempo da ocorrência.
3. O usuário deve poder selecionar um marcador ou cartão de ocorrência e abrir o detalhe do post correspondente.
4. O sistema deve sincronizar os alertas ativos com o feed da comunidade, evitando duplicidade de ocorrência.
5. O usuário deve poder visualizar sua posição e pesquisar/selecionar uma região quando conceder permissão de localização.
6. O sistema deve informar indisponibilidade do mapa, tiles ou localização e oferecer uma alternativa de uso sem travar a tela.
7. Alertas devem ser apresentados como apoio à decisão; o sistema não deve prometer que uma rota está livre de riscos.

### RF-05 — Criação e gestão de alertas/posts

1. Usuário autenticado deve poder criar uma publicação com descrição, categoria da ocorrência e localização.
2. O formulário deve permitir, quando suportado, anexar imagem ou vídeo e visualizar o anexo antes do envio.
3. Categorias devem contemplar, no mínimo, acidente/colisão, obra, perigo na via, trânsito parado e outros.
4. O sistema deve validar campos obrigatórios, tamanho/formato de mídia e conteúdo antes de publicar.
5. O sistema deve permitir cancelar a publicação sem salvar conteúdo incompleto, solicitando confirmação quando houver dados preenchidos.
6. Uma publicação criada deve aparecer no feed e no mapa quando possuir localização válida.
7. O autor deve poder editar ou excluir as próprias publicações, sujeito às regras de auditoria e moderação.
8. O usuário deve poder denunciar conteúdo incorreto, abusivo ou perigoso.

### RF-06 — Feed e interação comunitária

1. O sistema deve listar publicações da comunidade com autor, tempo, conteúdo/mídia, categoria e localização quando disponível.
2. O usuário deve poder abrir o detalhe de uma publicação.
3. O usuário autenticado deve poder curtir/descurtir, comentar e compartilhar uma publicação.
4. O sistema deve exibir contadores e estado da interação de forma consistente após cada ação.
5. Comentários devem permitir inclusão, visualização e, quando autorizado, exclusão pelo autor ou moderação.
6. O feed deve possuir estado de carregamento, vazio, erro e atualização, incluindo indicação de conteúdo recente quando aplicável.

### RF-07 — Busca, perfis e notificações

1. O sistema deve permitir buscar por texto em publicações, usuários e locais.
2. O sistema deve permitir filtrar os resultados por todos, posts, usuários e locais.
3. O usuário deve poder visualizar perfil público, publicações do perfil, seguir/deixar de seguir e iniciar contato quando esse recurso estiver habilitado.
4. O sistema deve gerar notificações para novo post relevante, comentário, curtida, novo seguidor e demais eventos configurados.
5. O usuário deve poder abrir uma notificação, marcar como lida e acessar o recurso relacionado.
6. O sistema deve distinguir visualmente notificações lidas e não lidas e exibir estado vazio quando não houver notificações.

## 5. Requisitos não funcionais

| ID | Requisito | Critério verificável |
| --- | --- | --- |
| RNF-01 | Arquitetura | Organizar a aplicação em camadas separadas de apresentação, domínio/serviços e persistência, preservando responsabilidades de um MVC ou equivalente. |
| RNF-02 | Responsividade | Adotar abordagem mobile-first; os fluxos principais devem funcionar sem rolagem horizontal em larguras de 320 px ou superiores e adaptar-se a desktop. |
| RNF-03 | Acessibilidade | Usar HTML semântico, labels associados, foco visível, navegação por teclado, mensagens de erro acessíveis, contraste adequado e ARIA apenas quando necessário; alvo WCAG 2.1 AA. |
| RNF-04 | Segurança de transporte | Disponibilizar produção exclusivamente via HTTPS, com redirecionamento de HTTP e política de cookies segura. |
| RNF-05 | Segurança de identidade | Não armazenar senhas em texto puro; aplicar hash forte no servidor, expiração/rotação de sessão, proteção contra CSRF, XSS, injeção e abuso de tentativas de login. |
| RNF-06 | Privacidade | Solicitar consentimento para geolocalização, explicar finalidade, minimizar dados coletados e oferecer remoção/atualização conforme a LGPD aplicável. |
| RNF-07 | Integridade de conteúdo | Validar dados no cliente e no servidor, sanitizar texto/mídia e restringir tipos, tamanho e origem de uploads. |
| RNF-08 | Desempenho | Exibir shell inicial rapidamente em rede móvel, aplicar carregamento lazy para mídia/mapa e paginação ou carregamento incremental no feed. |
| RNF-09 | Disponibilidade | Tratar falhas de API, autenticação, mapa e notificações com estados de erro recuperáveis, sem perder silenciosamente uma publicação. |
| RNF-10 | Consistência | Usar componentes e regras de estado compartilhados para cabeçalho, menu, posts, ações, notificações e feedbacks. |
| RNF-11 | Compatibilidade | Suportar versões atuais de Chrome, Firefox, Safari e Edge em desktop e mobile, com degradação aceitável quando geolocalização ou mídia não estiverem disponíveis. |
| RNF-12 | Observabilidade | Registrar eventos técnicos sem dados sensíveis, incluindo erros de autenticação, publicação, mapa e integrações externas, com correlação por requisição. |
| RNF-13 | Manutenibilidade | Manter código modular, nomes consistentes, documentação de contratos e testes automatizados dos fluxos críticos. |
| RNF-14 | Licenças e terceiros | Respeitar atribuição/licença de Leaflet, OpenStreetMap, Font Awesome, Flaticon e demais serviços utilizados, incluindo limites e políticas de uso. |

## 6. Histórias de usuário

### Épico A — Conta e acesso

- **HU-01:** Como visitante, quero criar uma conta com nome, e-mail e senha para participar da comunidade.
- **HU-02:** Como usuário, quero entrar com minhas credenciais para acessar recursos personalizados.
- **HU-03:** Como usuário, quero entrar com Google ou Apple para reduzir o esforço de autenticação.
- **HU-04:** Como usuário, quero recuperar meu acesso sem expor minha senha para voltar a utilizar a plataforma com segurança.

### Épico B — Consulta de segurança viária

- **HU-05:** Como motorista, quero visualizar alertas no mapa ao vivo para evitar rotas com acidentes.
- **HU-06:** Como motorista, quero filtrar ou identificar categorias de alerta para entender rapidamente o risco da região.
- **HU-07:** Como motorista, quero abrir o detalhe de um marcador para conhecer a descrição, horário, mídia e origem do alerta.
- **HU-08:** Como usuário, quero pesquisar um local ou região para consultar ocorrências próximas ao meu destino.

### Épico C — Contribuição da comunidade

- **HU-09:** Como motorista, quero publicar um alerta com categoria, descrição e localização para avisar outras pessoas.
- **HU-10:** Como usuário, quero anexar uma foto ou vídeo da ocorrência para dar contexto ao alerta.
- **HU-11:** Como autor, quero editar ou remover minha publicação para corrigir informações ou retirar um alerta encerrado.
- **HU-12:** Como usuário, quero denunciar conteúdo incorreto ou abusivo para ajudar a manter a comunidade confiável.

### Épico D — Feed e relacionamento

- **HU-13:** Como membro da comunidade, quero visualizar um feed de posts recentes para acompanhar as condições das vias.
- **HU-14:** Como usuário, quero curtir, comentar e compartilhar um post para contribuir com a informação.
- **HU-15:** Como usuário, quero pesquisar posts, usuários e locais para encontrar uma informação específica.
- **HU-16:** Como usuário, quero visitar um perfil e seguir pessoas relevantes para acompanhar suas contribuições.
- **HU-17:** Como usuário, quero receber notificações de comentários, curtidas, seguidores e novos posts para não perder interações importantes.

### Épico E — Usabilidade e confiança

- **HU-18:** Como usuário de celular, quero navegar pelo menu e publicar um alerta usando uma tela responsiva para utilizar o serviço em trânsito com segurança, sem depender de desktop.
- **HU-19:** Como usuário com deficiência, quero operar formulários, menu, mapa e notificações por teclado e leitor de tela para acessar as mesmas funções.
- **HU-20:** Como usuário, quero receber mensagens claras quando o mapa, localização ou publicação falhar para saber como continuar.

## 7. Critérios de aceite transversais

- Toda ação deve apresentar estado de carregamento, sucesso, erro ou vazio quando aplicável.
- Usuários não autenticados não devem publicar, comentar, curtir, seguir ou enviar mensagens; devem receber orientação para entrar.
- Dados de localização só devem ser coletados após permissão e devem ter alternativa manual.
- Texto inserido por usuários não pode ser interpretado como HTML ou script.
- A publicação só é considerada concluída após confirmação persistida pelo servidor; falhas devem permitir tentar novamente.
- Componentes interativos devem ter nome acessível, foco visível e funcionamento por teclado.
- O conteúdo do mapa e do feed deve indicar atualização/tempo da ocorrência e evitar apresentar dados potencialmente antigos como ao vivo.

## 8. Pendências para validação antes da implementação

1. Definir categorias oficiais, ciclo de vida e prazo de expiração dos alertas.
2. Definir se o mapa exibirá rotas calculadas ou apenas ocorrências geolocalizadas.
3. Confirmar limites de tamanho, formatos e retenção de imagens/vídeos.
4. Confirmar regras de moderação, denúncia, bloqueio e papel de administrador.
5. Definir política de notificações (web push, e-mail ou apenas central interna).
6. Escolher backend, banco de dados, provedor de identidade e provedor de mapas/geocodificação.
7. Definir métricas de aceite de desempenho e disponibilidade para produção.

## 9. Rastreabilidade inicial

| Fluxo | Requisitos relacionados | Histórias relacionadas |
| --- | --- | --- |
| Login/cadastro | RF-01, RF-02, RNF-04 a RNF-07 | HU-01 a HU-04 |
| Mapa e alertas | RF-04, RF-05, RNF-02, RNF-08, RNF-09, RNF-14 | HU-05 a HU-08 |
| Feed e post | RF-05, RF-06, RNF-07, RNF-10 | HU-09 a HU-14 |
| Busca e perfil | RF-07, RNF-02, RNF-03, RNF-11 | HU-15, HU-16 |
| Notificações | RF-07, RNF-09, RNF-12 | HU-17 |
| Acessibilidade e experiência | RF-03, RNF-02, RNF-03, RNF-10, RNF-11 | HU-18 a HU-20 |

