# ReEncontro — Sistema de Achados e Perdidos

Sistema web de achados e perdidos desenvolvido para o **SESI Nova Odessa**, como Trabalho de Conclusão de Curso (TCC) do Curso Técnico em Desenvolvimento de Sistemas — SENAI "Dr. Celso Charuri", Unidade Sumaré.

O ReEncontro digitaliza e formaliza o processo de registro e devolução de objetos perdidos na escola. Qualquer pessoa pode consultar os itens encontrados sem login e, ao reconhecer um pertence, reivindicá-lo pelo botão "É meu!". As funcionárias (inspetoras e diretora) gerenciam os itens e validam as reivindicações por uma área restrita.

## Links de produção

| Ambiente | URL |
|---|---|
| Aplicação web (frontend) | https://re-encontro.vercel.app |
| API (backend) | https://reencontro.onrender.com |
| Healthcheck da API | https://reencontro.onrender.com/health |

> O backend está hospedado no plano gratuito do Render, que suspende o serviço após 15 minutos de inatividade. A primeira requisição após esse período pode levar cerca de 1 minuto para responder enquanto o serviço reinicia. Um monitor de uptime externo mantém o serviço ativo durante o horário de uso.

## Funcionalidades

**Área pública (sem login)**
- Listagem de itens disponíveis com foto, categoria, local e data
- Filtros por categoria, data e busca por palavra-chave
- Reivindicação de item pelo botão "É meu!" (permitida sem cadastro)

**Área do responsável (com login)**
- Cadastro tradicional (e-mail e senha) ou entrada com conta Google
- Vínculo de um ou mais alunos à conta
- Acompanhamento das próprias reivindicações (em andamento e histórico)
- Gestão dos alunos vinculados (listar, adicionar e editar)
- Edição do perfil, alteração de senha e escolha de avatar
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
- Relatórios por período com métricas e gráficos
- Gestão de contas de funcionárias (exclusivo da diretora)
- Exclusão de dados pessoais conforme a LGPD (exclusivo da diretora)

## Stack

**Backend**
- Node.js + Express (JavaScript, ES Modules)
- MySQL 8 (driver mysql2, SQL puro — sem ORM)
- JWT + bcrypt (autenticação e hash de senhas)
- google-auth-library (validação do token do Google)
- Multer + Cloudinary (upload e armazenamento de fotos)
- Brevo (envio de e-mails transacionais via API HTTP)
- Zod (validação de entrada), Helmet (segurança de headers)

**Frontend**
- React + Vite + TypeScript
- React Router (navegação)
- Tailwind CSS + shadcn/ui (interface)
- Recharts (gráficos dos relatórios)
- @react-oauth/google (login com Google)
- lucide-react (ícones)

**Infraestrutura**
- Vercel (frontend)
- Render (backend)
- Aiven (banco MySQL em nuvem)
- Cloudinary (armazenamento de imagens)
- Brevo (serviço de e-mail)
- GitHub Actions (integração contínua)

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

### Padrão de projeto: Singleton

A classe `Database` (em `src/database/Database.js`) implementa o padrão criacional **Singleton**, garantindo que exista uma única instância do pool de conexões em toda a aplicação:

```javascript
class Database {
  static #instancia = null;
  #pool;

  constructor() {
    if (Database.#instancia) {
      throw new Error('Use Database.getInstance() para obter a conexão.');
    }
    this.#pool = mysql.createPool({ /* ... */ });
    Database.#instancia = this;
  }

  static getInstance() {
    if (!Database.#instancia) new Database();
    return Database.#instancia;
  }

  getPool() { return this.#pool; }
}
```

O construtor lança exceção se chamado diretamente; o acesso ocorre exclusivamente pelo método estático `getInstance()`, que cria o objeto na primeira chamada e devolve sempre a mesma referência nas demais. Sem esse controle, cada módulo que importasse o arquivo poderia abrir um novo pool, esgotando o limite de conexões do banco.

## Estrutura do repositório

```
ReEncontro/
├── backend/
│   ├── migrations/
│   │   └── schema_reencontro.sql      # schema completo do banco
│   ├── src/
│   │   ├── config/                    # cloudinary, email, reexport do database
│   │   ├── controllers/               # camada HTTP
│   │   ├── database/                  # Database.js (Singleton do pool MySQL)
│   │   ├── middlewares/               # auth, role, upload, error
│   │   ├── models/                    # schemas de validação (Zod)
│   │   ├── repositories/              # queries SQL
│   │   ├── routes/                    # endpoints + index.js
│   │   ├── services/                  # regras de negócio
│   │   ├── utils/                     # tokens (JWT), templates de e-mail, logger
│   │   ├── app.js                     # configura Express
│   │   └── server.js                  # sobe o servidor
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/             # telas e componentes
│   │   │   └── App.tsx                 # rotas (React Router)
│   │   ├── contexts/                   # AuthContext (sessão do usuário)
│   │   ├── lib/
│   │   │   ├── api.ts                  # camada de comunicação com a API
│   │   │   ├── auth.ts                 # helpers de sessão
│   │   │   └── avatar.ts               # geração dos avatares
│   │   ├── assets/                     # logo e imagens
│   │   └── main.tsx
│   ├── vercel.json                     # rewrites para o React Router
│   └── package.json
└── .github/workflows/ci.yml            # validação automática a cada push
```

## Banco de dados

MySQL 8 (charset utf8mb4), com as tabelas:

`users`, `alunos`, `categorias`, `pontos_coleta`, `itens`, `item_fotos`, `reivindicacoes`, `password_resets`, `refresh_tokens`, `notificacoes`.

O schema completo está em `backend/migrations/schema_reencontro.sql`, com chaves estrangeiras, índices e dados iniciais (seeds) de categorias e pontos de coleta.

Decisões de modelagem relevantes:

- Perfil unificado de funcionária — a diretora é uma funcionária com a flag `is_diretora`
- Ausência de CPF e coleta mínima de dados, em conformidade com a LGPD
- Snapshot imutável dos dados do requerente no momento da reivindicação, para fins de histórico (RN-018)
- Soft delete em categorias e pontos de coleta, preservando a integridade dos registros históricos (RN-017)
- `senha_hash` opcional, já que contas criadas pelo Google podem não ter senha definida

## Endpoints da API

**Autenticação**

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| POST | `/api/auth/register` | Público | Cadastro de responsável com alunos vinculados |
| POST | `/api/auth/login` | Público | Login por e-mail e senha, retorna token JWT |
| POST | `/api/auth/google` | Público | Login ou cadastro com conta Google |
| POST | `/api/auth/completar-cadastro` | Autenticado | Finaliza o cadastro iniciado pelo Google |
| POST | `/api/auth/esqueci-senha` | Público | Solicita link de redefinição de senha |
| POST | `/api/auth/redefinir-senha` | Público | Redefine a senha com token temporário (1h) |

**Itens**

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| GET | `/api/itens` | Público | Lista itens disponíveis (com filtros) |
| GET | `/api/itens/:id` | Público | Detalhe de um item |
| GET | `/api/itens/finalizados` | Funcionária | Histórico de entregues ou descartados |
| POST | `/api/itens` | Funcionária | Cadastra item com upload de fotos |
| PATCH | `/api/itens/:id` | Funcionária | Edita os dados de um item |
| PATCH | `/api/itens/:id/descartar` | Funcionária | Descarta um item (soft delete) |

**Reivindicações**

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| POST | `/api/reivindicacoes` | Público* | Cria reivindicação (transação com lock) |
| GET | `/api/reivindicacoes/pendentes` | Funcionária | Lista reivindicações aguardando validação |
| GET | `/api/reivindicacoes/em-processo` | Funcionária | Lista reivindicações aprovadas |
| GET | `/api/reivindicacoes/minhas` | Autenticado | Lista as reivindicações do usuário logado |
| PATCH | `/api/reivindicacoes/:id/aprovar` | Funcionária | Aprova uma reivindicação |
| PATCH | `/api/reivindicacoes/:id/rejeitar` | Funcionária | Rejeita com justificativa obrigatória |
| PATCH | `/api/reivindicacoes/:id/entregar` | Funcionária | Confirma a entrega física do item |
| PATCH | `/api/reivindicacoes/:id/cancelar` | Funcionária | Cancela com justificativa obrigatória |
| PATCH | `/api/reivindicacoes/reverter/:itemId` | Funcionária | Reverte entrega feita há menos de 24h |

**Alunos**

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| GET | `/api/alunos/meus` | Autenticado | Lista os alunos do responsável logado |
| POST | `/api/alunos` | Autenticado | Cadastra um aluno vinculado à conta |
| PATCH | `/api/alunos/:id` | Autenticado | Edita um aluno da própria conta |

**Usuários e perfil**

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| PATCH | `/api/usuarios/perfil` | Autenticado | Edita os próprios dados cadastrais |
| PATCH | `/api/usuarios/senha` | Autenticado | Altera a própria senha |
| PATCH | `/api/usuarios/avatar` | Autenticado | Atualiza o avatar escolhido |
| GET | `/api/usuarios/funcionarias` | Diretora | Lista as contas de funcionárias |
| POST | `/api/usuarios/funcionarias` | Diretora | Cadastra uma nova funcionária |
| PATCH | `/api/usuarios/funcionarias/:id` | Diretora | Edita os dados de uma funcionária |
| PATCH | `/api/usuarios/funcionarias/:id/status` | Diretora | Ativa ou desativa uma conta |

**Relatórios, referências e LGPD**

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| GET | `/api/relatorios` | Funcionária | Métricas do acervo por período |
| GET | `/api/categorias` | Público | Lista as categorias ativas |
| GET | `/api/pontos-coleta` | Público | Lista os pontos de coleta ativos |
| GET | `/api/lgpd/buscar` | Diretora | Localiza um responsável pelo e-mail |
| POST | `/api/lgpd/anonimizar` | Diretora | Anonimiza os dados de um titular |

\* A criação de reivindicação usa autenticação opcional: se houver token válido, a reivindicação é vinculada ao usuário; caso contrário, é registrada de forma anônima.

## Como rodar localmente

### Pré-requisitos
- Node.js 20 ou superior
- MySQL 8 instalado e rodando
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

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=reencontro
DB_SSL=false

JWT_SECRET=uma_chave_secreta_longa
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=30d

CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

BREVO_API_KEY=...
BREVO_FROM_EMAIL=...
BREVO_FROM_NAME=ReEncontro

GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

> Para conectar a um banco em nuvem que exija conexão criptografada (como o Aiven), defina `DB_SSL=true`.

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
```

> As variáveis do Vite são lidas em tempo de build. Após alterar o `.env`, reinicie o servidor de desenvolvimento. Em produção, essas variáveis são configuradas no painel da Vercel.

## Segurança

- Senhas armazenadas com hash bcrypt (nunca em texto puro)
- Autenticação por token JWT, com middlewares de autenticação e de perfil (RBAC)
- Tokens de redefinição de senha armazenados apenas como hash, com validade de 1 hora e uso único
- Validação do token do Google no servidor, junto à própria API do Google
- Todas as queries usam prepared statements com placeholders, incluindo consultas com filtros dinâmicos
- Helmet e CORS configurados na aplicação Express
- Validação de toda entrada de dados com Zod antes de chegar à lógica de negócio
- Isolamento entre contas: consultas de dados pessoais sempre filtram pelo identificador extraído do token
- Arquivos `.env` fora do versionamento (protegidos pelo `.gitignore`)

## Integração contínua

O repositório possui um workflow do GitHub Actions (`.github/workflows/ci.yml`) que, a cada push na branch principal, valida a sintaxe dos arquivos do backend e executa o build do frontend. Falhas são sinalizadas antes que o código chegue ao ambiente de produção.

O deploy é contínuo: a Vercel e o Render reconstroem automaticamente suas respectivas aplicações a cada novo commit na branch principal.

## Equipe

| Integrante | Papel |
|---|---|
| Ana Julia Monteiro Panizo | Scrum Master + Back-end + DevOps |
| Ana Laura Bachega | Back-end |
| Beatriz Braga de Paula | QA + Banco de dados |
| Letícia Amaral Monari | Front-end + Responsividade |
| Lucas Munhoz Penha | Front-end |
| Marcello Augusto da Silva Santos | QA + Banco de dados |

Orientadores: Prof. Matheus Luis Oliveira de Camargo e Prof.ª Ana Caroline Farias Tomaz Lopes.

## Licença

Projeto acadêmico desenvolvido para fins educacionais — SENAI / SESI, 2026.
