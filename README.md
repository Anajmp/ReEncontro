# ReEncontro — Sistema de Achados e Perdidos

Sistema web de achados e perdidos desenvolvido para o **SESI Nova Odessa**, como Trabalho de Conclusão de Curso (TCC) do Curso Técnico em Desenvolvimento de Sistemas — SENAI "Dr. Celso Charuri", Unidade Sumaré.

O ReEncontro digitaliza e formaliza o processo de registro e devolução de objetos perdidos na escola. Qualquer pessoa pode consultar os itens encontrados sem login e, ao reconhecer um pertence, reivindicá-lo pelo botão "É meu!". As funcionárias (inspetoras e diretora) gerenciam os itens e validam as reivindicações por uma área restrita.

## 🔗 Links de produção

| Ambiente | URL |
|---|---|
| Aplicação web (frontend) | https://re-encontro.vercel.app |
| API (backend) | https://reencontro-production.up.railway.app |
| Healthcheck da API | https://reencontro-production.up.railway.app/health |

## ✨ Funcionalidades

**Área pública (sem login)**
- Listagem de itens disponíveis com foto, categoria, local e data
- Filtros por categoria, data e busca por palavra-chave
- Reivindicação de item pelo botão "É meu!"

**Área do responsável (com login)**
- Cadastro com vínculo de um ou mais alunos
- Acompanhamento das próprias reivindicações
- Gestão dos alunos sob responsabilidade

**Área restrita (funcionárias e diretora)**
- Cadastro de itens encontrados com múltiplas fotos
- Validação (aprovar/rejeitar) das reivindicações
- Acompanhamento de itens em processo de retirada
- Histórico de itens finalizados (entregues ou descartados)
- Relatórios gerenciais
- Gestão de funcionárias (exclusivo da diretora)

## 🛠️ Stack

**Backend**
- Node.js + Express (JavaScript, ES Modules)
- MySQL 8 (driver mysql2, SQL puro)
- JWT + bcrypt (autenticação)
- Multer + Cloudinary (upload e armazenamento de fotos)
- Nodemailer (envio de e-mails)
- Zod (validação), Helmet, express-rate-limit, Pino

**Frontend**
- React + Vite + TypeScript
- React Router (navegação)
- Tailwind CSS + shadcn/ui (interface)

**Infraestrutura**
- Railway (backend + banco MySQL)
- Vercel (frontend)
- Cloudinary (imagens)
- GitHub (versionamento)

## 🏗️ Arquitetura

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

O frontend é um SPA (Single Page Application) em React, hospedado na Vercel, que consome a API REST hospedada no Railway. As fotos dos itens são enviadas ao Cloudinary, e o banco guarda apenas as URLs.

## 📁 Estrutura do repositório

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
    │   ├── styles/
    │   └── main.tsx
    ├── vercel.json                     # rewrites para o React Router
    └── package.json
```

## 🗄️ Banco de dados

10 tabelas em MySQL 8 (charset utf8mb4):

`users`, `alunos`, `categorias`, `pontos_coleta`, `itens`, `item_fotos`, `reivindicacoes`, `password_resets`, `refresh_tokens`, `notificacoes`.

O schema completo está em `backend/migrations/schema_reencontro.sql`, com chaves estrangeiras, índices e dados iniciais (seeds) de categorias e pontos de coleta.

Decisões de modelagem relevantes: perfil unificado de funcionária (a diretora é uma funcionária com a flag `is_diretora`); ausência de CPF e coleta mínima de dados, em conformidade com a LGPD; e snapshot imutável dos dados do requerente no momento da reivindicação, para fins de histórico.

## 🚀 Como rodar localmente

### Pré-requisitos
- Node.js 20 ou superior
- MySQL 8 instalado e rodando
- Git

### Backend

```bash
cd backend
npm install
cp .env.example .env        # preencha com seus dados (veja abaixo)
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

JWT_SECRET=uma_chave_secreta_longa
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=30d

CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

A aplicação abre em `http://localhost:5173`. Configure a variável `VITE_API_URL` apontando para a API (local ou de produção).

## 📋 Documentação da API

Os endpoints estão documentados no Insomnia. A coleção pode ser importada do arquivo `docs/insomnia_reencontro.json` (Insomnia → Import).

## 👥 Equipe

| Integrante | Papel |
|---|---|
| Ana Julia Monteiro Panizo | Scrum Master + Back-end + DevOps |
| Ana Laura Bachega | Back-end |
| Beatriz Braga de Paula | QA + Banco de dados |
| Letícia Amaral Monari | Front-end + Responsividade |
| Lucas Munhoz Penha | Front-end |
| Marcello Augusto da Silva Santos | QA + Banco de dados |

Orientadores: Prof. Matheus Luis Oliveira de Camargo e Prof.ª Ana Caroline Farias Tomaz Lopes.

## 📄 Licença

Projeto acadêmico desenvolvido para fins educacionais — SENAI / SESI, 2026.
