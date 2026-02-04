# Safe Drive

Plataforma comunitária de segurança viária para compartilhamento de informações em tempo real sobre condições de trânsito e locais de risco.

## 📋 Descrição do Projeto

Safe Drive é uma aplicação web que permite usuários a se conectarem, visualizarem mapas interativos e compartilharem informações sobre segurança viária em sua comunidade.

## 🛠️ Tecnologias e Extensões Utilizadas

### Frontend

| Tecnologia | Versão | Descrição |
|-----------|--------|-----------|
| **HTML5** | 5 | Linguagem de marcação para estrutura das páginas |
| **CSS3** | 3 | Estilização e design responsivo das páginas |
| **JavaScript** | ES6+ | Lógica interativa e manipulação do DOM |

### Bibliotecas Externas

| Biblioteca | Versão | Descrição | URL |
|-----------|--------|-----------|-----|
| **Leaflet.js** | Última | Biblioteca de mapa interativo de código aberto | https://leafletjs.com |
| **OpenStreetMap** | - | Serviço de mapa de tiles para visualização geográfica | https://www.openstreetmap.org |
| **Font Awesome** | 6.0.0-beta3 | Biblioteca de ícones e símbolos SVG | https://fontawesome.com |
| **Flaticon** | - | Ícones customizados via CDN | https://cdn-icons-png.flaticon.com |

### Recursos de Acessibilidade

- Atributos ARIA para melhor navegação assistida
- Suporte a navegação por teclado
- Labels semânticas para formulários

## 📁 Estrutura do Projeto

```
Safe Drive/
├── index.html                 # Página de login
├── central.html              # Central da comunidade
├── mapa.html                 # Mapa interativo
├── p_safedrive.html          # Página inicial Safe Drive
├── google.html               # Integração Google
├── apple.html                # Integração Apple
│
├── login.css                 # Estilos da página de login
├── central.css               # Estilos da central
├── mapa.css                  # Estilos do mapa
├── p_safedrive.css           # Estilos página inicial
│
├── script.js                 # Scripts JavaScript principal
├── redirecionamento.js       # Scripts de redirecionamento
│
├── Imagens/                  # Pasta com imagens do projeto
├── img/                      # Pasta adicional de imagens
└── favicon/                  # Ícone do site
    └── site.webmanifest
```

## 🎯 Páginas Principais

- **index.html** - Página de autenticação de usuários
- **central.html** - Central comunitária com navegação e conteúdo principal
- **mapa.html** - Mapa interativo para visualização geográfica
- **p_safedrive.html** - Página inicial da plataforma

## 🌍 Integrações Externas

- **Google** - Integração para login via conta Google
- **Apple** - Integração para login via conta Apple
- **Flaticon** - Ícones customizados para interface
- **Font Awesome** - Biblioteca de ícones para UI

## 📱 Responsividade

O projeto utiliza meta tags viewport para garantir responsividade em dispositivos móveis:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
```

## 🔐 Validação de Formulários

- Validação de email com regex
- Verificação de senha com requisitos específicos
- Inputs com atributo `required` para campos obrigatórios

## 📦 Compatibilidade

- Navegadores modernos (Chrome, Firefox, Safari, Edge)
- Suporte a PWA (Progressive Web App) via manifest
- Design mobile-first

## 🎨 Recursos de Design

- Menu responsivo com botão hamburger
- Navegação primária e secundária
- Ícones Font Awesome para melhor UX
- Favicon customizado

## 📝 Licenças das Dependências

- **Leaflet.js**: BSD 2-Clause License
- **OpenStreetMap**: ODbL License
- **Font Awesome**: CC BY 4.0 License
- **Flaticon**: Flaticon License

---

**Desenvolvido como plataforma de segurança viária colaborativa**
