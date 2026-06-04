export const swaggerSpec = {
	openapi: '3.0.0',
	info: {
		title: 'Learning OWASP Top 10',
		version: '1.0.0',
		description: 'API para demonstrar e proteger contra as vulnerabilidades do OWASP Top 10 (2025)',
	},
	servers: [{ url: 'http://localhost:3000' }],
	components: {
		securitySchemes: {
			bearerAuth: {
				type: 'http',
				scheme: 'bearer',
				bearerFormat: 'JWT',
			},
		},
	},
	tags: [
		{
			name: 'A01 — Login',
			description: 'Autenticação para obter o token JWT',
		},
		{
			name: 'A01 — Vulnerável',
			description:
				'Rotas sem controle de acesso adequado. Autenticação presente, autorização ausente.',
		},
		{
			name: 'A01 — Protegido',
			description:
				'Rotas com ownership check (GET) e RBAC (DELETE).',
		},
		{
			name: 'A02 — Vulnerável',
			description:
				'Express com configuração padrão: `X-Powered-By` exposto, CORS aberto para qualquer origem, stack trace vazando em erros.',
		},
		{
			name: 'A02 — Protegido',
			description:
				'`helmet` ativo (remove `X-Powered-By`, adiciona CSP, HSTS, X-Frame-Options), CORS restrito, erro genérico em produção.',
		},
		{
			name: 'A03 — Vulnerável',
			description:
				'Dependência sem auditoria: a função `formatUsername` faz o que promete mas tem um side effect escondido que exfiltra o input para um servidor externo — padrão real do ataque `event-stream` (2018) e `node-ipc` (2022).',
		},
		{
			name: 'A03 — Protegido',
			description:
				'Versão auditada da lib: sem side effects. Prevenção complementada por `npm audit --audit-level=moderate` no CI (`.github/workflows/audit.yml`) e `package-lock.json` fixado no repositório.',
		},
		{
			name: 'A04 — Vulnerável',
			description:
				'Falhas criptográficas: senha salva em texto puro, JWT assinado com secret `abc123` hardcoded no código, sem expiração, `password_hash` exposto na resposta.',
		},
		{
			name: 'A04 — Protegido',
			description:
				'`bcrypt` com 12 salt rounds, JWT secret carregado de `process.env.JWT_SECRET`, expiração de 2h, resposta nunca retorna hash ou campos internos.',
		},
	],
	paths: {
		'/a01/login': {
			post: {
				tags: ['A01 — Login'],
				summary: 'Login e emissão de token JWT',
				description:
					'Retorna um JWT com id, email e role. Use o token nas rotas protegidas.\n\n**Usuários disponíveis:**\n- `alice@example.com` — role: admin\n- `bob@example.com` — role: user\n- `carol@example.com` — role: user',
				requestBody: {
					required: true,
					content: {
						'application/json': {
							schema: {
								type: 'object',
								required: ['email'],
								properties: {
									email: { type: 'string', example: 'bob@example.com' },
								},
							},
						},
					},
				},
				responses: {
					200: {
						description: 'Token JWT gerado',
						content: {
							'application/json': {
								schema: {
									type: 'object',
									properties: {
										token: { type: 'string' },
									},
								},
							},
						},
					},
					404: { description: 'Usuário não encontrado' },
				},
			},
		},
		'/a01/vulnerable/users/{id}': {
			get: {
				tags: ['A01 — Vulnerável'],
				summary: '[IDOR] Retorna dados de qualquer usuário pelo UUID',
				description:
					'**Vulnerabilidade:** Qualquer usuário autenticado acessa dados de outro usuário trocando o `{id}` na URL. Não há verificação de ownership.\n\n**Ataque:** Faça login como Bob, pegue o UUID da Alice no response e use aqui.',
				security: [{ bearerAuth: [] }],
				parameters: [
					{
						name: 'id',
						in: 'path',
						required: true,
						description: 'UUID de qualquer usuário (inclusive de outro)',
						schema: { type: 'string', format: 'uuid' },
					},
				],
				responses: {
					200: { description: 'Dados do usuário retornados (sem ownership check)' },
					401: { description: 'Token ausente ou inválido' },
					404: { description: 'Usuário não encontrado' },
				},
			},
		},
		'/a01/vulnerable/admin/users/{id}': {
			delete: {
				tags: ['A01 — Vulnerável'],
				summary: '[Privilege Escalation] Deleta qualquer usuário sem verificar role',
				description:
					'**Vulnerabilidade:** Qualquer usuário autenticado (mesmo com role `user`) consegue deletar qualquer outro usuário. Não há verificação de role.\n\n**Ataque:** Faça login como Bob (user), use o UUID da Alice (admin) e delete.',
				security: [{ bearerAuth: [] }],
				parameters: [
					{
						name: 'id',
						in: 'path',
						required: true,
						description: 'UUID do usuário a deletar',
						schema: { type: 'string', format: 'uuid' },
					},
				],
				responses: {
					200: { description: 'Usuário deletado (sem role check)' },
					401: { description: 'Token ausente ou inválido' },
				},
			},
		},
		'/a01/protected/users/{id}': {
			get: {
				tags: ['A01 — Protegido'],
				summary: '[Ownership Check] Retorna dados apenas do próprio usuário',
				description:
					'**Proteção:** `verifyOwnership` compara `req.user.id === params.id`. Se Bob tentar acessar o UUID da Alice, recebe 403.\n\n**Teste:** Use o UUID do próprio usuário logado para ter sucesso.',
				security: [{ bearerAuth: [] }],
				parameters: [
					{
						name: 'id',
						in: 'path',
						required: true,
						description: 'UUID do usuário (deve ser o mesmo do token)',
						schema: { type: 'string', format: 'uuid' },
					},
				],
				responses: {
					200: { description: 'Dados retornados (ownership verificado)' },
					401: { description: 'Token ausente ou inválido' },
					403: { description: 'Acesso negado: não é o dono do recurso' },
				},
			},
		},
		'/a01/protected/admin/users/{id}': {
			delete: {
				tags: ['A01 — Protegido'],
				summary: '[RBAC] Deleta usuário — apenas admins',
				description:
					'**Proteção:** `requireRole("admin")` bloqueia qualquer usuário com role diferente de `admin` com 403.\n\n**Teste:** Bob (user) recebe 403. Alice (admin) consegue deletar.',
				security: [{ bearerAuth: [] }],
				parameters: [
					{
						name: 'id',
						in: 'path',
						required: true,
						description: 'UUID do usuário a deletar',
						schema: { type: 'string', format: 'uuid' },
					},
				],
				responses: {
					200: { description: 'Usuário deletado (role admin verificado)' },
					401: { description: 'Token ausente ou inválido' },
					403: { description: 'Acesso negado: privilégio insuficiente' },
					404: { description: 'Usuário não encontrado' },
				},
			},
		},
		'/a02/vulnerable/info': {
			get: {
				tags: ['A02 — Vulnerável'],
				summary: '[Misconfiguration] Headers padrão do Express',
				description:
					'**Vulnerabilidade:** `X-Powered-By: Express` presente na resposta — informa o atacante sobre a stack.\n\n**Como testar:** Execute e abra a aba **"Response headers"** abaixo. Procure `x-powered-by: Express` e a ausência de headers como `x-frame-options` e `strict-transport-security`.\n\n**CORS:** Aceita `Origin: http://evil.com` sem restrição.',
				responses: {
					200: {
						description: 'Resposta com headers inseguros',
						headers: {
							'X-Powered-By': {
								description: 'Revela que o servidor usa Express',
								schema: { type: 'string', example: 'Express' },
							},
							'Access-Control-Allow-Origin': {
								description: 'CORS aberto para qualquer origem',
								schema: { type: 'string', example: '*' },
							},
						},
						content: {
							'application/json': {
								schema: {
									type: 'object',
									properties: {
										message: { type: 'string' },
										hint: { type: 'string' },
									},
								},
							},
						},
					},
				},
			},
		},
		'/a02/vulnerable/error': {
			get: {
				tags: ['A02 — Vulnerável'],
				summary: '[Stack Trace] Erro expõe internals do servidor',
				description:
					'**Vulnerabilidade:** O handler de erro devolve `stack`, `path` e `method` na resposta — o atacante mapeia a estrutura interna da aplicação.\n\n**Resposta esperada:**\n```json\n{\n  "error": "Falha interna simulada",\n  "stack": "Error: ...\\n    at triggerError (.../vulnerable.controller.ts:8:9)\\n    at ...",\n  "path": "/error",\n  "method": "GET"\n}\n```',
				responses: {
					500: {
						description: 'Erro com stack trace completo exposto',
						content: {
							'application/json': {
								schema: {
									type: 'object',
									properties: {
										error: { type: 'string' },
										stack: { type: 'string', description: 'Stack trace completo — nunca expor em produção' },
										path: { type: 'string' },
										method: { type: 'string' },
									},
								},
							},
						},
					},
				},
			},
		},
		'/a02/protected/info': {
			get: {
				tags: ['A02 — Protegido'],
				summary: '[helmet] Headers de segurança ativos',
				description:
					'**Proteção:** `helmet()` remove `X-Powered-By` e injeta automaticamente:\n- `X-Frame-Options: SAMEORIGIN` — bloqueia clickjacking\n- `X-Content-Type-Options: nosniff` — evita MIME sniffing\n- `Strict-Transport-Security` — força HTTPS\n- `Content-Security-Policy` — restringe fontes de scripts\n\n**Como testar:** Execute e abra **"Response headers"**. Compare com a rota vulnerável — `x-powered-by` ausente, novos headers presentes.\n\n**CORS:** Origem `http://evil.com` é bloqueada.',
				responses: {
					200: {
						description: 'Resposta com headers de segurança do helmet',
						headers: {
							'X-Frame-Options': {
								description: 'Proteção contra clickjacking',
								schema: { type: 'string', example: 'SAMEORIGIN' },
							},
							'X-Content-Type-Options': {
								description: 'Proteção contra MIME sniffing',
								schema: { type: 'string', example: 'nosniff' },
							},
							'Strict-Transport-Security': {
								description: 'Força HTTPS',
								schema: { type: 'string', example: 'max-age=15552000; includeSubDomains' },
							},
						},
						content: {
							'application/json': {
								schema: {
									type: 'object',
									properties: {
										message: { type: 'string' },
										hint: { type: 'string' },
									},
								},
							},
						},
					},
				},
			},
		},
		'/a04/vulnerable/register': {
			post: {
				tags: ['A04 — Vulnerável'],
				summary: '[Plaintext] Salva senha em texto puro',
				description:
					'**Vulnerabilidade:** A senha é armazenada diretamente no banco sem hash. Se o banco vazar, todas as senhas ficam expostas imediatamente.\n\n**Resposta:** retorna `password_stored_as` com a senha em claro para evidenciar o problema.',
				requestBody: {
					required: true,
					content: {
						'application/json': {
							schema: {
								type: 'object',
								required: ['name', 'email', 'password'],
								properties: {
									name: { type: 'string', example: 'Dave Vulnerable' },
									email: { type: 'string', example: 'dave@example.com' },
									password: { type: 'string', example: 'minhasenha123' },
								},
							},
						},
					},
				},
				responses: {
					201: {
						description: 'Usuário criado com senha em texto puro',
						content: {
							'application/json': {
								schema: {
									type: 'object',
									properties: {
										message: { type: 'string' },
										password_stored_as: { type: 'string', example: 'minhasenha123' },
									},
								},
							},
						},
					},
				},
			},
		},
		'/a04/vulnerable/login': {
			post: {
				tags: ['A04 — Vulnerável'],
				summary: '[Weak JWT] Login com secret hardcoded e sem expiração',
				description:
					'**Vulnerabilidades:**\n- Compara senha com `===` direto no plaintext\n- JWT assinado com `abc123` hardcoded — qualquer pessoa que leia o código consegue forjar tokens\n- JWT sem `expiresIn` — token válido para sempre\n- Resposta inclui `password_hash` (que aqui é plaintext)\n\n**Teste:** registre com `/a04/vulnerable/register`, depois faça login aqui.',
				requestBody: {
					required: true,
					content: {
						'application/json': {
							schema: {
								type: 'object',
								required: ['email', 'password'],
								properties: {
									email: { type: 'string', example: 'dave@example.com' },
									password: { type: 'string', example: 'minhasenha123' },
								},
							},
						},
					},
				},
				responses: {
					200: {
						description: 'Token gerado com secret fraco + password_hash exposto',
						content: {
							'application/json': {
								schema: {
									type: 'object',
									properties: {
										token: { type: 'string' },
										password_hash: { type: 'string', description: 'Exposto na resposta — nunca fazer isso' },
									},
								},
							},
						},
					},
					401: { description: 'Credenciais inválidas' },
				},
			},
		},
		'/a04/protected/register': {
			post: {
				tags: ['A04 — Protegido'],
				summary: '[bcrypt] Salva senha com hash de 12 rounds',
				description:
					'**Proteção:** `bcrypt.hash(password, 12)` gera um hash irreversível com salt aleatório. Mesmo que o banco vaze, as senhas não ficam expostas — um ataque de força bruta em bcrypt com 12 rounds leva anos por senha.\n\n**Resposta:** não retorna nenhum dado sensível.',
				requestBody: {
					required: true,
					content: {
						'application/json': {
							schema: {
								type: 'object',
								required: ['name', 'email', 'password'],
								properties: {
									name: { type: 'string', example: 'Eve Protected' },
									email: { type: 'string', example: 'eve@example.com' },
									password: { type: 'string', example: 'minhasenha123' },
								},
							},
						},
					},
				},
				responses: {
					201: {
						description: 'Usuário criado com senha hasheada',
						content: {
							'application/json': {
								schema: {
									type: 'object',
									properties: {
										message: { type: 'string' },
									},
								},
							},
						},
					},
				},
			},
		},
		'/a04/protected/login': {
			post: {
				tags: ['A04 — Protegido'],
				summary: '[bcrypt + JWT seguro] Login com hash e secret via env',
				description:
					'**Proteções:**\n- `bcrypt.compare` valida a senha contra o hash (sem expor o hash)\n- JWT assinado com `process.env.JWT_SECRET` (nunca hardcoded)\n- JWT com `expiresIn: 2h`\n- Resposta retorna apenas o token — nenhum campo interno\n\n**Teste:** registre com `/a04/protected/register`, depois faça login aqui.',
				requestBody: {
					required: true,
					content: {
						'application/json': {
							schema: {
								type: 'object',
								required: ['email', 'password'],
								properties: {
									email: { type: 'string', example: 'eve@example.com' },
									password: { type: 'string', example: 'minhasenha123' },
								},
							},
						},
					},
				},
				responses: {
					200: {
						description: 'Token gerado — sem dados sensíveis na resposta',
						content: {
							'application/json': {
								schema: {
									type: 'object',
									properties: {
										token: { type: 'string' },
									},
								},
							},
						},
					},
					401: { description: 'Credenciais inválidas' },
				},
			},
		},
		'/a03/vulnerable/process': {
			post: {
				tags: ['A03 — Vulnerável'],
				summary: '[Compromised Dep] formatUsername com side effect de exfiltração',
				description:
					'**Vulnerabilidade:** `formatUsername` vem de uma lib sem auditoria. Além de formatar o nome, ela faz um `fetch` silencioso para `attacker.example.com` com o valor recebido.\n\n**Padrão real:** `event-stream` (2018) roubava chaves de carteiras Bitcoin; `node-ipc` (2022) apagava arquivos em sistemas russos/bielorussos. Ambos passaram despercebidos porque a função principal funcionava corretamente.\n\n**Como detectar:** `npm audit`, revisão de código do `node_modules`, ferramentas como Socket.dev.',
				requestBody: {
					required: true,
					content: {
						'application/json': {
							schema: {
								type: 'object',
								required: ['name'],
								properties: {
									name: { type: 'string', example: 'Bob User' },
								},
							},
						},
					},
				},
				responses: {
					200: {
						description: 'Nome formatado — e silenciosamente exfiltrado',
						content: {
							'application/json': {
								schema: {
									type: 'object',
									properties: {
										formatted: { type: 'string', example: 'bob user' },
										warning: { type: 'string' },
									},
								},
							},
						},
					},
				},
			},
		},
		'/a03/protected/process': {
			post: {
				tags: ['A03 — Protegido'],
				summary: '[Audited Dep] formatUsername limpa — sem side effects',
				description:
					'**Proteção:** Lib auditada — código revisado, sem side effects. Combinada com:\n- `npm audit --audit-level=moderate` bloqueando o build no CI se houver CVE de severidade moderate ou superior\n- `package-lock.json` no repositório garantindo reprodutibilidade (impede substituição silenciosa de versões)\n- `npm ci` no CI em vez de `npm install` (respeita o lockfile)',
				requestBody: {
					required: true,
					content: {
						'application/json': {
							schema: {
								type: 'object',
								required: ['name'],
								properties: {
									name: { type: 'string', example: 'Bob User' },
								},
							},
						},
					},
				},
				responses: {
					200: {
						description: 'Nome formatado — sem exfiltração',
						content: {
							'application/json': {
								schema: {
									type: 'object',
									properties: {
										formatted: { type: 'string', example: 'bob user' },
									},
								},
							},
						},
					},
				},
			},
		},
		'/a02/protected/error': {
			get: {
				tags: ['A02 — Protegido'],
				summary: '[Error Handler] Erro genérico sem internals',
				description:
					'**Proteção:** O handler de erro global retorna apenas uma mensagem genérica — nenhum detalhe interno chega ao cliente.\n\n**Resposta esperada:**\n```json\n{\n  "error": "Erro interno do servidor"\n}\n```',
				responses: {
					500: {
						description: 'Erro genérico sem stack trace',
						content: {
							'application/json': {
								schema: {
									type: 'object',
									properties: {
										error: { type: 'string', example: 'Erro interno do servidor' },
									},
								},
							},
						},
					},
				},
			},
		},
	},
}
