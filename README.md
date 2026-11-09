# ReEncontro — Sistema de Achados e Perdidos

Sistema web de achados e perdidos desenvolvido para o **SESI Nova Odessa**, como Trabalho de Conclusão de Curso (TCC) do Curso Técnico em Desenvolvimento de Sistemas — SENAI "Dr. Celso Charuri", Unidade Sumaré.

O ReEncontro digitaliza e formaliza o processo de registro e devolução de objetos perdidos na escola. Qualquer pessoa pode consultar os itens encontrados sem login e, ao reconhecer um pertence, reivindicá-lo pelo botão "É meu!". As funcionárias (inspetoras e diretora) gerenciam os itens e validam as reivindicações por uma área restrita.

## Links de produção

| Ambiente                 | URL                                    |
| ------------------------ | -------------------------------------- |
| Aplicação web (frontend) | https://re-encontro.vercel.app         |
| API (backend)            | https://reencontro.onrender.com        |
| Healthcheck da API       | https://reencontro.onrender.com/health |

> O backend está hospedado no plano gratuito do Render, que suspende o serviço após 15 minutos de inatividade. A primeira requisição após esse período pode levar cerca de 1 minuto para responder enquanto o serviço reinicia. Um monitor de uptime externo mantém o serviço ativo durante o horário de uso.

## Funcionalidades

**Área pública (sem login)**

- Listagem paginada de itens disponíveis com foto, categoria, local e data
- Filtros por categoria, período e busca por palavra-chave, com ordenação
- Detalhe do item com galeria de fotos
- Reivindicação de item pelo botão "É meu!" (permitida sem cadastro)

**Área do responsável (com login)**

- Cadastro tradicional (e-mail e senha) ou entrada com conta Google
- Verificação de e-mail por código de 6 dígitos (validade de 15 minutos, 5 tentativas)
- Validação de telefone brasileiro (DDD, 8 ou 9 dígitos, formatação automática)
- Vínculo de um ou mais alunos à conta
- Acompanhamento das próprias reivindicações (em andamento e histórico)
- Gestão dos alunos vinculados (listar, adicionar e editar)
- Edição do perfil, alteração de senha com indicador de força e escolha de avatar
- Isolamento de dados: cada responsável visualiza apenas as próprias informações

**Área restrita (funcionárias e diretora)**

- Painel com indicadores e gráficos do acervo
- Cadastro de itens encontrados com upload de fotos
- Listagem e gestão de itens disponíveis (edição e descarte)
- Marcador visual para itens disponíveis há mais de 90 dias (RN-012)
- Validação das reivindicações pendentes (aprovar ou rejeitar com justificativa)
- Acompanhamento de itens em processo de retirada (confirmar entrega ou cancelar)
- Reversão de entrega dentro da janela de 24 horas (RN-015)
- Histórico de itens finalizados (entregues e descartados)
- Relatórios por período com métricas e gráficos (exclusivo da diretora)
- Gestão de contas de funcionárias (exclusivo da diretora)
- Exclusão de dados pessoais conforme a LGPD (exclusivo da diretora)

## Acessibilidade

A interface foi ajustada para atender ao nível **WCAG 2.1 AA** e conta com recursos de acessibilidade ativáveis pelo próprio usuário:

- Painel de acessibilidade flutuante, presente em todas as telas
- Ajuste do tamanho do texto em cinco níveis (90% a 150%)
- Modo de alto contraste
- Fonte de alta legibilidade (Atkinson Hyperlegible), voltada a leitores com baixa visão ou dislexia
- Leitura do conteúdo em voz alta (síntese de voz do navegador)
- Link "pular para o conteúdo" para quem navega por teclado
- Tema claro e escuro, com respeito à preferência do sistema operacional
- Rótulos `aria-*`, foco visível e navegação completa por teclado

As preferências de acessibilidade e de tema ficam salvas no navegador do usuário.

## Stack

**Backend**

- Node.js + Express (JavaScript, ES Modules)
- MySQL 8 (driver mysql2, SQL puro — sem ORM)
- JWT + bcrypt (autenticação e hash de senhas), com refresh token rotativo
- google-auth-library (validação do token do Google)
- Multer + Cloudinary (upload e armazenamento de fotos)
- Brevo (envio de e-mails transacionais via API HTTP)
- Zod (validação de entrada), Helmet (headers de segurança), compression (gzip)
- express-rate-limit (limitação de requisições)
- pino (log estruturado), Sentry (monitoramento de erros)
- Vitest (testes unitários)

**Frontend**

- React + Vite + TypeScript
- React Router (navegação)
- Tailwind CSS + shadcn/ui (interface)
- Recharts (gráficos dos relatórios)
- @react-oauth/google (login com Google)
- lucide-react (ícones), @fontsource/atkinson-hyperlegible (fonte acessível)
- Sentry (monitoramento de erros no navegador)

**Infraestrutura**

- Vercel (frontend)
- Render (backend)
- Aiven (banco MySQL em nuvem, conexão com SSL obrigatório)
- Cloudinary (armazenamento de imagens)
- Brevo (serviço de e-mail)
- GitHub Actions (integração contínua)
- Docker + docker compose (ambiente local opcional)

## Arquitetura

O sistema segue uma arquitetura **MVC em camadas** no backend, separando responsabilidades de forma clara:

```
Requisição HTTP
   → routes        (define endpoints e middlewares)
   → controllers   (lê req, valida com Zod, devolve res)
   → services      (regras de negócio, transações)
   → repositories  (única camada com SQL, sempre parametrizado)
   → Database      (Singleton: pool único de conexões)
   → MySQL
```

Toda query SQL fica isolada na camada de repositories, usando sempre prepared statements (`db.execute(sql, params)`), o que centraliza a proteção contra SQL injection.

Operações que alteram mais de uma tabela (como criar uma reivindicação, que insere o registro e atualiza o status do item) são executadas em **transações atômicas**. A criação de reivindicação usa `SELECT ... FOR UPDATE` para travar a linha do item durante a operação, garantindo que duas pessoas não consigam reivindicar o mesmo item simultaneamente.

O frontend é um SPA (Single Page Application) em React, hospedado na Vercel, que consome a API REST hospedada no Render. As fotos dos itens são enviadas ao Cloudinary, e o banco guarda apenas as URLs.

### Validação da configuração na inicialização

O arquivo `src/config/env.js` lê e valida todas as variáveis de ambiente antes de qualquer outro módulo ser carregado. Se alguma estiver ausente ou inválida — `FRONTEND_URL` que não seja uma URL completa, `JWT_SECRET` com menos de 32 caracteres, `CORS_ORIGINS` contendo `*` — o processo não sobe e imprime a lista de problemas.

A medida nasceu de uma falha real em produção: com `FRONTEND_URL` preenchida como `*`, os links de redefinição de senha eram enviados por e-mail apontando para `http://%2A/redefinir-senha`, sem que nenhum erro aparecesse nos logs. Falhar na inicialização é preferível a falhar silenciosamente na frente do usuário.

### Padrão de projeto: Singleton

A classe `Database` (em `src/database/Database.js`) implementa o padrão criacional **Singleton**, garantindo que exista uma única instância do pool de conexões em toda a aplicação:

```javascript
class Database {
  static #instancia = null;
  #pool;

  constructor() {
    if (Database.#instancia) {
      throw new Error("Use Database.getInstance() para obter a conexão.");
    }
    this.#pool = mysql.createPool({
      /* ... */
    });
    Database.#instancia = this;
  }

  static getInstance() {
    if (!Database.#instancia) new Database();
    return Database.#instancia;
  }

  getPool() {
    return this.#pool;
  }
}
```

O construtor lança exceção se chamado diretamente; o acesso ocorre exclusivamente pelo método estático `getInstance()`, que cria o objeto na primeira chamada e devolve sempre a mesma referência nas demais. Sem esse controle, cada módulo que importasse o arquivo poderia abrir um novo pool, esgotando o limite de conexões do banco.

## Estrutura do repositório

```
ReEncontro/
├── backend/
│   ├── migrations/
│   │   ├── schema_reencontro.sql       # schema completo e consolidado
│   │   ├── 002_inativa_categoria_eletronico.sql
│   │   ├── 003_refresh_tokens.sql
│   │   ├── 003_verificacao_email.sql
│   │   ├── 004_indices_listagem.sql
│   │   └── add_itens_nome.sql
│   ├── src/
│   │   ├── config/                     # env (validação), cloudinary, email, database
│   │   ├── controllers/                # camada HTTP (10 controllers)
│   │   ├── database/
│   │   │   ├── Database.js             # Singleton do pool MySQL
│   │   │   └── fusoHorario.js          # datas no fuso de Brasília
│   │   ├── docs/
│   │   │   └── insomnia_reencontro.json  # coleção para testar a API
│   │   ├── middlewares/                # auth, authOpcional, role, upload, rateLimit, error
│   │   ├── models/                     # classes de domínio + schemas Zod
│   │   ├── repositories/               # queries SQL (12 repositories)
│   │   ├── routes/                     # endpoints + index.js
│   │   ├── services/                   # regras de negócio (12 services)
│   │   ├── utils/                      # tokens (JWT), templates de e-mail, telefone, logger
│   │   ├── app.js                      # configura Express
│   │   └── server.js                   # sobe o servidor
│   ├── tests/                          # testes unitários (Vitest)
│   ├── instrument.js                   # inicialização do Sentry (via --import)
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── hooks/
│   │   ├── useAcessibilidade.ts         # fonte, contraste e legibilidade
│   │   └── useLeituraEmVoz.ts           # leitura do conteúdo em voz alta
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/              # 21 telas
│   │   │   │   ├── shared/              # componentes reaproveitados (23)
│   │   │   │   └── ui/                  # primitivas shadcn/ui (48)
│   │   │   └── App.tsx                  # rotas (React Router)
│   │   ├── contexts/                    # AuthContext e AuthProvider
│   │   ├── lib/
│   │   │   ├── api.ts                   # camada de comunicação com a API
│   │   │   ├── auth.ts                  # helpers de sessão
│   │   │   ├── avatar.ts                # geração dos avatares
│   │   │   ├── acessibilidade.ts        # foco e pular para o conteúdo
│   │   │   ├── senha.ts                 # cálculo de força da senha
│   │   │   ├── telefone.ts              # máscara e validação
│   │   │   └── tema.ts                  # tema claro/escuro
│   │   ├── assets/                      # logo e imagens
│   │   ├── styles/
│   │   └── main.tsx
│   ├── vercel.json                      # rewrites para o React Router
│   └── package.json
├── docker-compose.yml                   # MySQL + backend para desenvolvimento
└── .github/workflows/ci.yml             # lint, sintaxe, testes e build a cada push
```

## Banco de dados

MySQL 8 (engine InnoDB, charset utf8mb4), com **11 tabelas** e 16 chaves estrangeiras:

`users`, `alunos`, `categorias`, `pontos_coleta`, `itens`, `item_fotos`, `reivindicacoes`, `password_resets`, `email_verificacoes`, `refresh_tokens`, `notificacoes`.

O schema consolidado está em `backend/migrations/schema_reencontro.sql`, com chaves estrangeiras, índices e dados iniciais (seeds) de categorias e pontos de coleta. As migrações numeradas na mesma pasta registram as alterações aplicadas durante o desenvolvimento e já estão incorporadas ao schema consolidado.

Decisões de modelagem relevantes:

- Perfil unificado de funcionária — a diretora é uma funcionária com a flag `is_diretora`
- Ausência de CPF e coleta mínima de dados, em conformidade com a LGPD (RN-008)
- Snapshot imutável dos dados do requerente no momento da reivindicação, para fins de histórico (RN-018)
- Soft delete em categorias e pontos de coleta, preservando a integridade dos registros históricos (RN-017)
- `senha_hash` opcional, já que contas criadas pelo Google podem não ter senha definida
- Códigos de verificação e tokens de redefinição armazenados apenas como hash
- Índices dedicados às listagens paginadas e aos filtros da área pública

## Endpoints da API

São **41 endpoints** sob o prefixo `/api`, mais o healthcheck em `/health`.

**Autenticação**

| Método | Rota                                     | Acesso      | Descrição                                          |
| ------ | ---------------------------------------- | ----------- | -------------------------------------------------- |
| POST   | `/api/auth/registrar`                    | Público     | Cadastro de responsável com alunos vinculados      |
| POST   | `/api/auth/login`                        | Público     | Login por e-mail e senha, retorna token JWT        |
| POST   | `/api/auth/google`                       | Público     | Login ou cadastro com conta Google                 |
| POST   | `/api/auth/completar-cadastro`           | Autenticado | Finaliza o cadastro iniciado pelo Google           |
| POST   | `/api/auth/refresh`                      | Público     | Renova o token de acesso (refresh token rotativo)  |
| POST   | `/api/auth/logout`                       | Público     | Invalida o refresh token da sessão                 |
| POST   | `/api/auth/esqueci-senha`                | Público     | Solicita link de redefinição de senha              |
| POST   | `/api/auth/redefinir-senha`              | Público     | Redefine a senha com token temporário (1h)         |
| POST   | `/api/auth/enviar-codigo-verificacao`    | Autenticado | Envia código de 6 dígitos para o e-mail            |
| POST   | `/api/auth/confirmar-codigo-verificacao` | Autenticado | Confirma o código e marca o e-mail como verificado |

**Itens**

| Método | Rota                       | Acesso      | Descrição                                                |
| ------ | -------------------------- | ----------- | -------------------------------------------------------- |
| GET    | `/api/itens`               | Público     | Lista itens disponíveis (filtros, ordenação e paginação) |
| GET    | `/api/itens/:id`           | Público     | Detalhe de um item                                       |
| GET    | `/api/itens/finalizados`   | Funcionária | Histórico de entregues ou descartados (paginado)         |
| POST   | `/api/itens`               | Funcionária | Cadastra item com upload de fotos                        |
| PATCH  | `/api/itens/:id`           | Funcionária | Edita os dados de um item                                |
| PATCH  | `/api/itens/:id/descartar` | Funcionária | Descarta um item com justificativa (RN-014)              |

**Reivindicações**

| Método | Rota                                   | Acesso      | Descrição                                        |
| ------ | -------------------------------------- | ----------- | ------------------------------------------------ |
| POST   | `/api/reivindicacoes`                  | Público\*   | Cria reivindicação (transação com lock de linha) |
| GET    | `/api/reivindicacoes/pendentes`        | Funcionária | Lista reivindicações aguardando validação        |
| GET    | `/api/reivindicacoes/em-processo`      | Funcionária | Lista reivindicações aprovadas                   |
| GET    | `/api/reivindicacoes/minhas`           | Autenticado | Lista as reivindicações do usuário logado        |
| PATCH  | `/api/reivindicacoes/:id/aprovar`      | Funcionária | Aprova uma reivindicação                         |
| PATCH  | `/api/reivindicacoes/:id/rejeitar`     | Funcionária | Rejeita com justificativa obrigatória            |
| PATCH  | `/api/reivindicacoes/:id/entregar`     | Funcionária | Confirma a entrega física do item                |
| PATCH  | `/api/reivindicacoes/:id/cancelar`     | Funcionária | Cancela com justificativa obrigatória            |
| PATCH  | `/api/reivindicacoes/reverter/:itemId` | Funcionária | Reverte entrega feita há menos de 24h            |

**Alunos**

| Método | Rota               | Acesso      | Descrição                             |
| ------ | ------------------ | ----------- | ------------------------------------- |
| GET    | `/api/alunos/meus` | Autenticado | Lista os alunos do responsável logado |
| POST   | `/api/alunos`      | Autenticado | Cadastra um aluno vinculado à conta   |
| PATCH  | `/api/alunos/:id`  | Autenticado | Edita um aluno da própria conta       |

**Usuários e perfil**

| Método | Rota                                    | Acesso      | Descrição                          |
| ------ | --------------------------------------- | ----------- | ---------------------------------- |
| PATCH  | `/api/usuarios/perfil`                  | Autenticado | Edita os próprios dados cadastrais |
| PATCH  | `/api/usuarios/senha`                   | Autenticado | Altera a própria senha             |
| PATCH  | `/api/usuarios/avatar`                  | Autenticado | Atualiza o avatar escolhido        |
| GET    | `/api/usuarios/funcionarias`            | Diretora    | Lista as contas de funcionárias    |
| POST   | `/api/usuarios/funcionarias`            | Diretora    | Cadastra uma nova funcionária      |
| PATCH  | `/api/usuarios/funcionarias/:id`        | Diretora    | Edita os dados de uma funcionária  |
| PATCH  | `/api/usuarios/funcionarias/:id/status` | Diretora    | Ativa ou desativa uma conta        |

**Relatórios, referências e LGPD**

| Método | Rota                        | Acesso      | Descrição                           |
| ------ | --------------------------- | ----------- | ----------------------------------- |
| GET    | `/api/relatorios/dashboard` | Funcionária | Indicadores do painel inicial       |
| GET    | `/api/relatorios`           | Diretora    | Métricas do acervo por período      |
| GET    | `/api/categorias`           | Público     | Lista as categorias ativas          |
| GET    | `/api/pontos-coleta`        | Público     | Lista os pontos de coleta ativos    |
| GET    | `/api/lgpd/buscar`          | Diretora    | Localiza um responsável pelo e-mail |
| POST   | `/api/lgpd/anonimizar`      | Diretora    | Anonimiza os dados de um titular    |

\* A criação de reivindicação usa autenticação opcional: se houver token válido, a reivindicação é vinculada ao usuário; caso contrário, é registrada de forma anônima.

Uma coleção pronta para testar todos os endpoints está em `backend/src/docs/insomnia_reencontro.json`.

## Segurança

- Senhas armazenadas com hash bcrypt (nunca em texto puro)
- Autenticação por token JWT de acesso curto (15 min) com **refresh token rotativo**: cada renovação invalida o token anterior, de modo que um token vazado deixa de servir assim que a sessão legítima renova
- Middlewares de autenticação e de perfil (RBAC) separados: `authMiddleware`, `apenasFuncionaria`, `apenasDiretora`
- Tokens de redefinição de senha e códigos de verificação armazenados apenas como hash, com validade e uso único; a comparação do código usa `timingSafeEqual`
- Validação do token do Google no servidor, junto à própria API do Google
- Todas as queries usam prepared statements com placeholders, incluindo consultas com filtros dinâmicos
- Helmet, compression e CORS com lista explícita de origens (o curinga `*` é rejeitado na inicialização)
- Validação de toda entrada de dados com Zod antes de chegar à lógica de negócio
- Isolamento entre contas: consultas de dados pessoais sempre filtram pelo identificador extraído do token
- Validação das variáveis de ambiente antes de o servidor subir (ver seção de arquitetura)
- Arquivos `.env` fora do versionamento (protegidos pelo `.gitignore`)

### Limitação de requisições

O middleware `rateLimitMiddleware.js` aplica limites em duas dimensões — por conta/e-mail e por IP — para que um endereço compartilhado (a rede da escola, por exemplo) não bloqueie todos os usuários de uma vez. Como o Render fica atrás de proxy reverso, o Express é configurado com `trust proxy` para que o IP real chegue ao contador.

| Limite                          | Janela | Teto                     | Chave       |
| ------------------------------- | ------ | ------------------------ | ----------- |
| Geral da API                    | 15 min | 600 (autenticado) / 3000 | conta ou IP |
| Login e cadastro                | 15 min | 10                       | IP + e-mail |
| Login e cadastro (por IP)       | 15 min | 100                      | IP          |
| Esqueci minha senha             | 1 h    | 3                        | e-mail      |
| Esqueci minha senha (por IP)    | 1 h    | 20                       | IP          |
| Redefinição de senha            | 15 min | 20                       | IP          |
| Código de verificação de e-mail | 1 h    | 3                        | conta       |
| Reivindicação                   | 1 h    | 5                        | conta ou IP |
| Reivindicação (por IP)          | 1 h    | 40                       | IP          |

Os limites de login não contam tentativas bem-sucedidas, então quem acerta a senha nunca é bloqueado — o teto atinge apenas quem está tentando adivinhar.

## Testes

Testes unitários com **Vitest**, executados automaticamente no pipeline de CI:

```bash
cd backend
npm test -- --run
```

| Arquivo                                 | Casos | O que cobre                                              |
| --------------------------------------- | ----- | -------------------------------------------------------- |
| `tests/telefone.test.js`                | 11    | Validação e formatação de telefone brasileiro            |
| `tests/emailVerificacaoService.test.js` | 9     | Geração, expiração e tentativas do código de verificação |
| `tests/itemSchema.test.js`              | 6     | Schema Zod do cadastro de item                           |

Total: **26 casos**. A validação funcional do sistema é complementada pelo roteiro de teste de aceitação (38 cenários) executado com as funcionárias da escola.

## Como rodar localmente

### Pré-requisitos

- Node.js 20 ou superior
- MySQL 8 instalado e rodando (ou Docker, ver abaixo)
- Git

### Backend

```bash
cd backend
npm install
# crie o arquivo .env com as variáveis abaixo
# rode o schema em backend/migrations/schema_reencontro.sql no seu MySQL
npm run dev
```

A API sobe em `http://localhost:3000`. Teste o healthcheck em `http://localhost:3000/health`.

Variáveis de ambiente do backend (`.env`):

```
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
CORS_ORIGINS=http://localhost:5173

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=reencontro
DB_SSL=false

JWT_SECRET=chave_com_no_minimo_32_caracteres
JWT_EXPIRES_IN=15m

CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

BREVO_API_KEY=...
BREVO_FROM_EMAIL=...
BREVO_FROM_NAME=ReEncontro

GOOGLE_CLIENT_ID=...

SENTRY_DSN=            # opcional; vazio desativa o monitoramento
```

Observações:

- `FRONTEND_URL` precisa ser uma URL completa (é dela que saem os links enviados por e-mail). O valor `*` quebra os links.
- `CORS_ORIGINS` aceita várias origens separadas por vírgula e não aceita `*`.
- `JWT_SECRET` precisa ter 32 caracteres ou mais. Gere com:
  ```bash
  node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
  ```
  Use valores diferentes em desenvolvimento e em produção.
- Para conectar a um banco em nuvem que exija conexão criptografada (como o Aiven), defina `DB_SSL=true` e, se o provedor fornecer um certificado, aponte `DB_SSL_CA` para ele.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

A aplicação abre em `http://localhost:5173`.

Variáveis de ambiente do frontend (`.env`):

```
VITE_API_URL=http://localhost:3000
VITE_GOOGLE_CLIENT_ID=...
VITE_SENTRY_DSN=       # opcional
```

> As variáveis do Vite são lidas em tempo de build. Após alterar o `.env`, reinicie o servidor de desenvolvimento. Em produção, essas variáveis são configuradas no painel da Vercel.

### Com Docker (opcional)

O `docker-compose.yml` sobe o MySQL já com o schema aplicado e o backend conectado a ele:

```bash
docker compose up
```

O MySQL fica exposto na porta `3307` do host (para não conflitar com uma instalação local) e o backend na `3000`. As variáveis de Cloudinary, Brevo e Google precisam ser preenchidas no arquivo antes do primeiro uso — sem elas a validação de ambiente impede o backend de subir.

## Integração contínua

O workflow do GitHub Actions (`.github/workflows/ci.yml`) roda a cada push na `main` e em cada pull request, em dois jobs paralelos:

- **Backend** — instala as dependências, verifica a sintaxe de todos os arquivos (`node --check`), roda o ESLint e executa os testes do Vitest
- **Frontend** — instala as dependências, roda o ESLint e compila o projeto (`vite build`)

Qualquer falha bloqueia o merge antes que o código chegue ao ambiente de produção.

O deploy é contínuo: a Vercel e o Render reconstroem automaticamente suas respectivas aplicações a cada novo commit na `main`.

## Monitoramento

- **Sentry** — captura erros não tratados no backend (inicializado em `instrument.js`, carregado antes da aplicação pela flag `--import`) e no navegador. Ativa-se apenas quando a variável `SENTRY_DSN` está definida, com amostragem de performance de 10% em produção.
- **pino** — log estruturado das requisições e dos erros do backend.
- **UptimeRobot** — monitor externo que consulta o `/health` em intervalos regulares, mantendo o serviço do Render ativo durante o horário de uso da escola.

## Equipe

| Integrante                       | Papel                            |
| -------------------------------- | -------------------------------- |
| Ana Julia Monteiro Panizo        | Scrum Master + Back-end + DevOps |
| Ana Laura Bachega                | Back-end                         |
| Beatriz Braga de Paula           | QA + Banco de dados              |
| Letícia Amaral Monari            | Front-end + Responsividade       |
| Lucas Munhoz Penha               | Front-end                        |
| Marcello Augusto da Silva Santos | QA + Banco de dados              |

Orientadores: Prof. Matheus Luis Oliveira de Camargo e Prof.ª Ana Caroline Farias Tomaz Lopes.

## Documentação complementar

Além deste README, o projeto conta com:

- **TAP** — Termo de Abertura do Projeto
- **DRS** — Documento de Requisitos de Software
- **Dicionário de dados** — descrição de todas as tabelas e colunas
- **Diagrama de classes** e **diagrama entidade-relacionamento**
- **Manual de uso** — material de treinamento das funcionárias
- **Roteiro de teste de aceitação** — 38 cenários
- **Monografia** — documentação acadêmica completa do TCC

## Licença

Projeto acadêmico desenvolvido para fins educacionais — SENAI / SESI, 2026.
