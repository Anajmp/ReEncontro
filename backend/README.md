# ReEncontro — Backend

API REST do sistema de achados e perdidos do SESI Nova Odessa.

## Stack

Node.js · Express · MySQL 8 (mysql2, SQL puro) · JWT · bcrypt · Zod · Multer + Cloudinary · Nodemailer

## Arquitetura — MVC em camadas (+ Service Layer)

```
Requisição
   │
   ▼
routes/        → define o endpoint e quais middlewares aplicar
   │
   ▼
middlewares/   → auth (JWT), role (funcionária/diretora), upload (fotos)
   │
   ▼
controllers/   → lê req, valida com o model (Zod), chama o service, devolve res
   │
   ▼
services/      → regras de negócio e orquestração (transações)
   │
   ▼
repositories/  → ÚNICA camada com SQL (db.execute com placeholders)
   │
   ▼
MySQL
```

### Responsabilidade de cada camada

| Camada | Faz | Não faz |
|---|---|---|
| **routes** | Mapeia URL → controller, aplica middlewares | Lógica |
| **controllers** | Lê `req`, valida, chama service, devolve `res` | SQL, regra de negócio |
| **services** | Regras de negócio, transações | Conhecer `req`/`res`, SQL cru |
| **repositories** | SQL (sempre com placeholders `?`) | Regra de negócio |
| **models** | Validação de dados (Zod) | — |
| **middlewares** | Auth, permissão, upload, erros | — |
| **config** | Conexões externas (banco, cloudinary, email) | — |

### Onde está o SQL

**Somente** em `repositories/`. Isso torna a auditoria de segurança trivial: para garantir que não há SQL injection, basta revisar os arquivos dessa pasta e confirmar que toda query usa `db.execute(sql, params)` com placeholders `?` — nunca concatenação de strings.

## Estrutura de pastas

```
backend/
├── migrations/
│   └── schema_reencontro.sql      # schema completo do banco
├── src/
│   ├── config/
│   │   ├── database.js            # pool MySQL
│   │   ├── cloudinary.js          # config Cloudinary
│   │   └── email.js               # config Nodemailer
│   ├── controllers/               # camada HTTP
│   ├── services/                  # regras de negócio
│   ├── repositories/              # SQL
│   ├── models/                    # validação Zod
│   ├── routes/                    # endpoints
│   │   └── index.js               # agrega todas as rotas
│   ├── middlewares/               # auth, role, upload, error
│   ├── utils/                     # tokens, logger
│   ├── app.js                     # configura Express
│   └── server.js                  # sobe o servidor
├── .env.example
└── package.json
```

## Módulo de referência: `itens`

O módulo `itens` está **totalmente implementado** como molde. Ele cobre os 5 arquivos da arquitetura:

- `routes/itensRoutes.js`
- `controllers/itensController.js`
- `services/itensService.js`
- `repositories/itensRepository.js`
- `models/itemSchema.js`

Os outros módulos (auth, reivindicacoes, usuarios, relatorios) estão como **placeholders** — siga o padrão do `itens` para implementá-los.

## Como rodar

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env
# (edite o .env com os dados do seu MySQL local, etc)

# 3. Garantir que o banco existe
# (rode o migrations/schema_reencontro.sql no MySQL Workbench)

# 4. Subir o servidor em modo dev (reinicia ao salvar)
npm run dev
```

O servidor sobe em `http://localhost:3000`. Teste o healthcheck:

```
GET http://localhost:3000/health
```

## Endpoints do módulo itens (já funcionais após implementar auth)

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| GET | `/api/itens` | Público | Lista itens disponíveis (com filtros) |
| GET | `/api/itens/:id` | Público | Detalhe de um item |
| POST | `/api/itens` | Funcionária | Cadastra item com fotos |

> Observação: o `POST /api/itens` depende do `authMiddleware`, que por sua vez depende do módulo `auth` (geração de token no login). Implemente o `auth` primeiro para testar o cadastro autenticado.

## Convenção

- ES Modules (`import`/`export`), não CommonJS
- Toda query SQL: `db.execute(sql, params)` com `?` — nunca concatenar
- Erros de negócio: `throw { status: 4xx, mensagem: '...' }` (capturados pelo errorMiddleware)
- Validação de entrada: sempre via schema Zod no controller
