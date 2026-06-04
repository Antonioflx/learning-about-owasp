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
- **Lint/Format:** Biome

---

## Estrutura

```
src/
├── db/
│   ├── client.ts           # conexão PostgreSQL
│   ├── migrate.ts          # criação das tabelas
│   └── seed/
│       ├── users.seed.ts   # dados iniciais de usuários
│       └── seed.ts         # agregador de seeds
├── modules/
│   ├── access-control/     # A01 — Broken Access Control
│   │   ├── controllers/
│   │   │   ├── protected.controller.ts
│   │   │   └── vulnerable.controller.ts
│   │   ├── middleware/
│   │   │   └── index.ts    # verifyToken, requireRole, verifyOwnership
│   │   ├── use-cases/
│   │   │   ├── get-user.use-case.ts
│   │   │   └── delete-user.use-case.ts
│   │   └── routes.ts
│   ├── errors/
│   │   ├── http-error.entity.ts   # HttpError, NotFoundError, ForbiddenError…
│   │   └── error.middleware.ts    # handler global de erros
│   └── user/
│       └── user.entity.ts         # UserEntity com isAdmin(), isUser()
├── types/
│   └── express.d.ts        # augmentação de Request com UserEntity
└── index.ts                # bootstrap do app
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
| A02 | Security Misconfiguration | 🔜 |
| A03 | Software Supply Chain Failures | 🔜 |
| A04 | Cryptographic Failures | 🔜 |
| A05 | Injection | 🔜 |
| A06 | Insecure Design | 🔜 |
| A07 | Authentication Failures | 🔜 |
| A08 | Software or Data Integrity Failures | 🔜 |
| A09 | Security Logging and Alerting Failures | 🔜 |
| A10 | Mishandling of Exceptional Conditions | 🔜 |

### A01 — Broken Access Control

Usuários acessando dados ou executando ações fora das suas permissões.

**Rotas vulneráveis** (`/a01/vulnerable/...`)
- `GET /vulnerable/users/:id` — qualquer usuário autenticado acessa dados de outro usuário (IDOR)
- `DELETE /vulnerable/admin/users/:id` — qualquer usuário autenticado pode deletar outro sem verificação de role

**Rotas protegidas** (`/a01/protected/...`)
- `GET /protected/users/:id` — middleware `verifyOwnership` bloqueia se `token.id !== params.id`
- `DELETE /protected/admin/users/:id` — middleware `requireRole(u => u.isAdmin())` bloqueia não-admins com 403

---

## Licença

MIT
