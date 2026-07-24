# learning-about-owasp

API em Node.js para estudo prático do **OWASP Top 10 (2025)**.

Cada vulnerabilidade é implementada duas vezes — uma rota **vulnerável** (o problema em código real) e uma rota **protegida** (a solução correta) — para que a diferença seja visível em tempo de execução.

---

## Stack

- **Runtime:** Node.js + TypeScript
- **Framework:** Express 5
- **Banco:** PostgreSQL (`pg`)
- **Auth:** JWT via `jose`
- **Docs:** Swagger UI (`swagger-ui-express`)
- **Logs:** `pino` / `pino-http`
- **Rate limit:** `express-rate-limit` + `node-cache`
- **Lint/Format:** Biome

---

## Estrutura

```
src/
├── config/
│   ├── env.config.ts          # valida e tipa as variáveis de ambiente (zod)
│   └── logger.ts              # instância pino compartilhada (A09)
├── db/
│   ├── client.ts              # conexão PostgreSQL
│   ├── migrate.ts             # criação das tabelas
│   └── seed/
│       ├── users.seed.ts      # dados iniciais de usuários
│       └── seed.ts            # agregador de seeds
├── modules/
│   ├── access-control/        # A01 — Broken Access Control
│   │   ├── controllers/
│   │   ├── middleware/        # verifyToken, requireRole, verifyOwnership
│   │   └── routes.ts
│   ├── security-misconfiguration/  # A02 — Security Misconfiguration
│   │   ├── controllers/
│   │   ├── middleware/        # vulnerableCors, protectedCors, secureHeaders
│   │   └── routes.ts
│   ├── supply-chain/          # A03 — Software Supply Chain Failures
│   │   ├── controllers/
│   │   ├── lib/               # malicious-util.ts, safe-util.ts
│   │   └── routes.ts
│   ├── cryptographic-failures/ # A04 — Cryptographic Failures
│   │   ├── controllers/
│   │   └── routes.ts
│   ├── injection/              # A05 — Injection
│   │   ├── controllers/
│   │   └── routes.ts
│   ├── insecure-design/        # A06 — Insecure Design
│   │   ├── controllers/
│   │   ├── lib/                # login-attempts.store.ts (lockout por e-mail)
│   │   ├── middleware/         # rate limiter por IP
│   │   └── routes.ts
│   ├── authentication-failures/ # A07 — Authentication Failures
│   │   ├── controllers/
│   │   ├── lib/                # token-blocklist.ts, refresh-token.store.ts
│   │   ├── middleware/         # AuthGuard (verifyTokenInsecure/Secure)
│   │   └── routes.ts
│   ├── data-integrity/         # A08 — Software or Data Integrity Failures
│   │   ├── controllers/
│   │   ├── lib/                # hmac.ts (sign/verify)
│   │   └── routes.ts
│   ├── logging/                # A09 — Security Logging and Alerting Failures
│   │   ├── controllers/
│   │   └── routes.ts
│   ├── exceptional-conditions/ # A10 — Mishandling of Exceptional Conditions
│   │   ├── controllers/
│   │   └── routes.ts
│   ├── errors/
│   │   ├── http-error.entity.ts   # HttpError, NotFoundError, ForbiddenError…
│   │   └── error.middleware.ts    # handler global de erros
│   ├── response/
│   │   └── http-response.ts   # HttpResponse com ok<T>, created<T>, noContent
│   └── user/
│       ├── use-cases/         # get, delete, register, find-for-auth
│       └── user.entity.ts     # UserEntity — isAdmin(), isUser()
├── types/
│   └── express.d.ts           # augmentação de Request com UserEntity
└── index.ts                   # bootstrap do app
```

---

## Como rodar

```bash
# instalar dependências
npm install

# configurar variáveis de ambiente
cp .env.example .env   # preencher DATABASE_URL e JWT_SECRET

# criar tabelas
npm run db:migrate

# popular banco
npm run db:seed

# iniciar em modo dev
npm run dev
```

Acesse a documentação interativa em `http://localhost:3000/docs`.

As variáveis de ambiente são validadas e tipadas em [src/config/env.config.ts](src/config/env.config.ts) — se faltar alguma variável obrigatória (ex: `JWT_SECRET`), a aplicação falha ao subir com uma mensagem indicando o que está errado, em vez de quebrar silenciosamente em runtime.

### Docker

```bash
cp .env.example .env   # preencher as variáveis

docker compose up --build
```

Sobe dois serviços: `postgres` e `api` (build a partir de [docker/Dockerfile](docker/Dockerfile), multi-stage). Ambos têm healthcheck — a API só inicia depois que o Postgres reporta `healthy` (`depends_on: condition: service_healthy`), e o próprio container da API expõe `GET /health` (checa a conexão com o banco) como `HEALTHCHECK` da imagem.

Depois de subir, rode as migrations dentro do container ou apontando `DATABASE_URL` para `localhost:5432` a partir do host:

```bash
npm run db:migrate
npm run db:seed
```

---

## Convenção de commits

```
feat:     nova funcionalidade
fix:      correção de bug
refactor: mudança de código sem alterar comportamento
docs:     atualização de documentação
chore:    tarefas de manutenção (deps, config, build)
```

---

## OWASP Top 10 — 2025

| # | Categoria | Status |
|---|-----------|--------|
| A01 | Broken Access Control | ✅ |
| A02 | Security Misconfiguration | ✅ |
| A03 | Software Supply Chain Failures | ✅ |
| A04 | Cryptographic Failures | ✅ |
| A05 | Injection | ✅ |
| A06 | Insecure Design | ✅ |
| A07 | Authentication Failures | ✅ |
| A08 | Software or Data Integrity Failures | ✅ |
| A09 | Security Logging and Alerting Failures | ✅ |
| A10 | Mishandling of Exceptional Conditions | ✅ |

### A01 — Broken Access Control

Usuários acessando dados ou executando ações fora das suas permissões.

**Rotas vulneráveis** (`/a01/vulnerable/...`)
- `GET /vulnerable/users/:id` — qualquer usuário autenticado acessa dados de outro usuário (IDOR)
- `DELETE /vulnerable/admin/users/:id` — qualquer usuário autenticado pode deletar outro sem verificação de role

**Rotas protegidas** (`/a01/protected/...`)
- `GET /protected/users/:id` — middleware `verifyOwnership` bloqueia se `token.id !== params.id`
- `DELETE /protected/admin/users/:id` — middleware `requireRole(u => u.isAdmin())` bloqueia não-admins com 403

### A02 — Security Misconfiguration

Configurações padrão inseguras expõem detalhes da stack e abrem brechas de CORS.

**Rotas vulneráveis** (`/a02/vulnerable/...`)
- `GET /vulnerable/info` — `X-Powered-By: Express` presente; CORS aceita qualquer origem (`*`)
- `GET /vulnerable/error` — handler devolve `stack`, `path` e `method` ao cliente

**Rotas protegidas** (`/a02/protected/...`)
- `GET /protected/info` — `helmet()` remove `X-Powered-By` e injeta `X-Frame-Options`, `Strict-Transport-Security`, `Content-Security-Policy`; CORS restrito à origem configurada
- `GET /protected/error` — handler genérico retorna apenas `{ "error": "Erro interno do servidor" }`

### A03 — Software Supply Chain Failures

Dependências comprometidas que executam código malicioso além da função declarada.

**Rotas vulneráveis** (`/a03/vulnerable/...`)
- `POST /vulnerable/process` — `formatUsername` executa o side effect malicioso além de formatar o nome (padrão real: `event-stream` 2018, `node-ipc` 2022)

**Rotas protegidas** (`/a03/protected/...`)
- `POST /protected/process` — versão auditada, sem side effects

**Proteção em camadas**
- `package-lock.json` no git — fixa versões exatas, impede upgrade silencioso
- `.github/workflows/audit.yml` — `npm audit --audit-level=moderate` bloqueia o build em todo push/PR se houver CVE
- `npm ci` no CI — respeita o lockfile estritamente (não atualiza nada)
- Scripts locais: `npm run audit`, `npm run outdated`

### A04 — Cryptographic Failures

Dados sensíveis sem proteção adequada — senhas em texto puro e JWT com chave fraca hardcoded.

**Rotas vulneráveis** (`/a04/vulnerable/...`)
- `POST /vulnerable/register` — senha salva em texto puro no banco; resposta retorna `password_stored_as` evidenciando o problema
- `POST /vulnerable/login` — compara plaintext com `===`, JWT assinado com `'abc123'` hardcoded, sem expiração, resposta expõe `password_hash`

**Rotas protegidas** (`/a04/protected/...`)
- `POST /protected/register` — `bcrypt.hash(password, 12)` — hash irreversível com salt aleatório
- `POST /protected/login` — `bcrypt.compare`, JWT via `process.env.JWT_SECRET`, expiração 2h, resposta retorna apenas o token

### A05 — Injection

Input do usuário enviado diretamente a interpretadores (SQL, shell).

**Rotas vulneráveis** (`/a05/vulnerable/...`)
- `GET /vulnerable/users?email=` — SQL concatenado: `' OR '1'='1` retorna todos os usuários

**Rotas protegidas** (`/a05/protected/...`)
- `GET /protected/users?email=` — `zod` valida o email; query usa `$1` (parameterizada) — injeção impossível

### A06 — Insecure Design

Falhas arquiteturais: enumeração de usuários pela resposta e ausência de limite de tentativas.

**Rotas vulneráveis** (`/a06/vulnerable/...`)
- `POST /vulnerable/login` — `404 "Email não encontrado"` vs `401 "Senha incorreta"` permite mapear e-mails cadastrados; sem rate limit

**Rotas protegidas** (`/a06/protected/...`)
- `POST /protected/login` — mensagem genérica (`fail securely`), `express-rate-limit` (5 req/15min por IP) + bloqueio de 1min por e-mail após 5 falhas (`node-cache`)

### A07 — Authentication Failures

Ciclo de vida de sessão mal implementado: token eterno e logout que não revoga nada.

**Rotas vulneráveis** (`/a07/vulnerable/...`)
- `POST /vulnerable/login` — JWT assinado sem `expiresIn`, válido para sempre
- `POST /vulnerable/logout` — não invalida nada
- `GET /vulnerable/profile` — aceita o token normalmente mesmo depois do "logout"

**Rotas protegidas** (`/a07/protected/...`)
- `POST /protected/login` — access token de 15min + refresh token opaco de uso único
- `POST /protected/refresh` — troca o refresh token (consumido no processo) por um novo par
- `POST /protected/logout` — revoga o access token (blocklist em memória) e o refresh token
- `GET /protected/profile` — rejeita token revogado ou expirado

### A08 — Software or Data Integrity Failures

Payload processado sem verificar origem ou integridade.

**Rotas vulneráveis** (`/a08/vulnerable/...`)
- `POST /vulnerable/config` — aplica qualquer JSON recebido, sem checar remetente

**Rotas protegidas** (`/a08/protected/...`)
- `POST /protected/config` — exige header `x-signature` com HMAC-SHA256 do payload (`crypto.createHmac` + `crypto.timingSafeEqual`); rejeita se não bater

### A09 — Security Logging and Alerting Failures

Logs ausentes ou insuficientes impedem detectar e investigar ataques.

**Rotas vulneráveis** (`/a09/vulnerable/...`)
- `POST /vulnerable/login` — `console.log` grava a senha em texto puro; erros inesperados são engolidos sem registro

**Rotas protegidas** (`/a09/protected/...`)
- `POST /protected/login` — logger estruturado `pino` (JSON): registra sucesso/falha de login e erros com IP, nunca a senha (campo redigido por config)

### A10 — Mishandling of Exceptional Conditions

Promise disparada sem tratamento — o tipo de erro que derruba um processo inteiro.

**Rotas vulneráveis** (`/a10/vulnerable/...`)
- `POST /vulnerable/process` — dispara uma tarefa assíncrona sem `await`/`.catch`; gera um `unhandledRejection` não tratado no ponto onde acontece

**Rotas protegidas** (`/a10/protected/...`)
- `POST /protected/process` — mesma tarefa, mas com `try/catch` e log estruturado do erro

**Rede de segurança global** (`src/index.ts`)
- `process.on('unhandledRejection', ...)` e `process.on('uncaughtException', ...)` — logam via `pino` e, no caso de `uncaughtException`, encerram o processo de forma controlada (`process.exit(1)`) em vez de deixá-lo em estado indefinido

---

## Licença

MIT
