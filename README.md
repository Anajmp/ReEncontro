# ReEncontro — Sistema de Achados e Perdidos

Sistema web de achados e perdidos desenvolvido para o **SESI Nova Odessa**, como Trabalho de Conclusão de Curso (TCC) do Curso Técnico em Desenvolvimento de Sistemas — SENAI "Dr. Celso Charuri", Unidade Sumaré.

O ReEncontro digitaliza e formaliza o processo de registro e devolução de objetos perdidos na escola. Qualquer pessoa pode consultar os itens encontrados sem login e, ao reconhecer um pertence, reivindicá-lo pelo botão "É meu!". As funcionárias (inspetoras e diretora) gerenciam os itens e validam as reivindicações por uma área restrita.

##  Links de produção

| Ambiente | URL |
|---|---|
| Aplicação web (frontend) | https://re-encontro.vercel.app |
| API (backend) | https://reencontro.onrender.com |
| Healthcheck da API | https://reencontro.onrender.com/health |

>  O backend está hospedado no plano gratuito do Render, que suspende o serviço após 15 minutos de inatividade. A primeira requisição após esse período pode levar cerca de 1 minuto para responder enquanto o serviço reinicia.

##  Funcionalidades

**Área pública (sem login)**
- Listagem de itens disponíveis com foto, categoria, local e data
- Filtros por categoria e busca por palavra-chave
- Reivindicação de item pelo botão "É meu!" (permitida sem cadastro)

**Área do responsável (com login)**
- Cadastro com vínculo de um ou mais alunos
- Acompanhamento das próprias reivindicações (em andamento e histórico)
- Isolamento de dados: cada responsável visualiza apenas as próprias reivindicações

**Área restrita (funcionárias e diretora)**
- Cadastro de itens encontrados com fotos
- Listagem e gestão de itens disponíveis (edição e descarte)
- Marcador visual para itens disponíveis há mais de 90 dias (RN-012)
- Validação das reivindicações pendentes (aprovar ou rejeitar com justificativa)
- Acompanhamento de itens em processo de retirada (confirmar entrega ou cancelar)
- Reversão de entrega dentro da janela de 24 horas (RN-015)

##  Stack

**Backend**
- Node.js + Express (JavaScript, ES Modules)
- MySQL 8 (driver mysql2, SQL puro — sem ORM)
- JWT + bcrypt (autenticação e hash de senhas)
- Multer + Cloudinary (upload e armazenamento de fotos)
- Zod (validação de entrada), Helmet (segurança de headers)
- Nodemailer (envio de e-mails — previsto, ainda não implementado)

**Frontend**
- React + Vite + TypeScript
- React Router (navegação)
- Tailwind CSS + shadcn/ui (interface)
- lucide-react (ícones)

**Infraestrutura**
- Vercel (frontend)
- Render (backend)
- Aiven (banco MySQL em nuvem)
- Cloudinary (armazenamento de imagens)
- GitHub (versionamento)

##  Arquitetura

O sistema segue uma arquitetura **MVC em camadas** no backend, separando responsabilidades de forma clara:

```
Requisição HTTP
   → routes        (define endpoints e middlewares)
   → controllers   (lê req, valida com Zod, devolve res)
   → services      (regras de negócio, transações)
   → repositories  (única camada com SQL, sempre via db.execute com placeholders)
   → MySQL
```

Toda query SQL fica isolada na camada de repositories, usando sempre prepared statements (`db.execute(sql, params)`), o que centraliza a proteção contra SQL injection.

Operações que alteram mais de uma tabela (como criar uma reivindicação, que insere o registro e atualiza o status do item) são executadas em **transações atômicas**. A criação de reivindicação usa `SELECT ... FOR UPDATE` para travar a linha do item durante a operação, garantindo que duas pessoas não consigam reivindicar o mesmo item simultaneamente.

O frontend é um SPA (Single Page Application) em React, hospedado na Vercel, que consome a API REST hospedada no Render. As fotos dos itens são enviadas ao Cloudinary, e o banco guarda apenas as URLs.

##  Estrutura do repositório

```
ReEncontro/
├── backend/
│   ├── migrations/
│   │   └── schema_reencontro.sql      # schema completo do banco (10 tabelas)
│   ├── src/
│   │   ├── config/                    # database (pool), cloudinary, email
│   │   ├── controllers/               # camada HTTP
│   │   ├── services/                  # regras de negócio
│   │   ├── repositories/              # queries SQL
│   │   ├── models/                    # validação Zod
│   │   ├── routes/                    # endpoints + index.js
│   │   ├── middlewares/               # auth, role, upload, error
│   │   ├── utils/                     # tokens (JWT), logger
│   │   ├── app.js                     # configura Express
│   │   └── server.js                  # sobe o servidor
│   └── package.json
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── components/             # telas e componentes
    │   │   └── App.tsx                 # rotas (React Router)
    │   ├── lib/
    │   │   ├── api.ts                  # camada de comunicação com a API
    │   │   └── auth.ts                 # helpers de sessão (token e usuário)
    │   ├── assets/                     # logo e imagens
    │   └── main.tsx
    ├── vercel.json                     # rewrites para o React Router
    └── package.json
```

##  Banco de dados

10 tabelas em MySQL 8 (charset utf8mb4):

`users`, `alunos`, `categorias`, `pontos_coleta`, `itens`, `item_fotos`, `reivindicacoes`, `password_resets`, `refresh_tokens`, `notificacoes`.

O schema completo está em `backend/migrations/schema_reencontro.sql`, com chaves estrangeiras, índices e dados iniciais (seeds) de categorias e pontos de coleta.

Decisões de modelagem relevantes: perfil unificado de funcionária (a diretora é uma funcionária com a flag `is_diretora`); ausência de CPF e coleta mínima de dados, em conformidade com a LGPD; e snapshot imutável dos dados do requerente no momento da reivindicação, para fins de histórico (RN-018).

##  Endpoints da API

**Autenticação**

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| POST | `/api/auth/register` | Público | Cadastro de responsável com alunos vinculados |
| POST | `/api/auth/login` | Público | Login, retorna token JWT |

**Itens**

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| GET | `/api/itens` | Público | Lista itens disponíveis (com filtros) |
| GET | `/api/itens/:id` | Público | Detalhe de um item |
| POST | `/api/itens` | Funcionária | Cadastra item com upload de foto |
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

\* A criação de reivindicação usa autenticação opcional: se houver token válido, a reivindicação é vinculada ao usuário; caso contrário, é registrada de forma anônima.

##  Como rodar localmente

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
```

> Para conectar a um banco em nuvem que exija conexão criptografada (como o Aiven), defina `DB_SSL=true`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

A aplicação abre em `http://localhost:5173`.

Variável de ambiente do frontend (`.env`):

```
VITE_API_URL=http://localhost:3000
```

> As variáveis do Vite são lidas em tempo de build. Após alterar o `.env`, reinicie o servidor de desenvolvimento. Em produção, `VITE_API_URL` é configurada no painel da Vercel e aponta para a URL do backend no Render.

##  Segurança

- Senhas armazenadas com hash bcrypt (nunca em texto puro)
- Autenticação por token JWT, com middlewares de autenticação e de perfil (RBAC)
- Todas as queries usam prepared statements com placeholders, incluindo consultas com filtros dinâmicos
- Helmet e CORS configurados na aplicação Express
- Validação de toda entrada de dados com Zod antes de chegar à lógica de negócio
- Arquivos `.env` fora do versionamento (protegidos pelo `.gitignore`)

Orientadores: Prof. Matheus Luis Oliveira de Camargo e Prof.ª Ana Caroline Farias Tomaz Lopes.

##  Licença

Projeto acadêmico desenvolvido para fins educacionais — SENAI / SESI, 2026.

