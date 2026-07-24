import { z } from 'zod'

const envSchema = z.object({
	NODE_ENV: z
		.enum(['development', 'production', 'test'])
		.default('development'),
	PORT: z.coerce.number().int().positive().default(3000),

	POSTGRES_HOST: z.string().min(1),
	POSTGRES_PORT: z.coerce.number().int().positive().default(5432),
	POSTGRES_USER: z.string().min(1),
	POSTGRES_PASSWORD: z.string().min(1),
	POSTGRES_DB: z.string().min(1),
	DATABASE_URL: z.string().min(1),

	JWT_SECRET: z.string().min(1, 'JWT_SECRET é obrigatório'),
	ALLOWED_ORIGIN: z.string().default('http://localhost:3000'),
	INTEGRITY_SECRET: z.string().default('dev-integrity-secret-change-me'),
})

type Env = z.infer<typeof envSchema>

class EnvConfig {
	private readonly env: Env

	constructor(source: NodeJS.ProcessEnv) {
		const parsed = envSchema.safeParse(source)

		if (!parsed.success) {
			const issues = parsed.error.issues
				.map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
				.join('\n')
			throw new Error(`Variáveis de ambiente inválidas:\n${issues}`)
		}

		this.env = parsed.data
	}

	get nodeEnv() {
		return this.env.NODE_ENV
	}

	get isProduction() {
		return this.env.NODE_ENV === 'production'
	}

	get port() {
		return this.env.PORT
	}

	get jwtSecret() {
		return this.env.JWT_SECRET
	}

	get allowedOrigin() {
		return this.env.ALLOWED_ORIGIN
	}

	get integritySecret() {
		return this.env.INTEGRITY_SECRET
	}

	get database() {
		return {
			host: this.env.POSTGRES_HOST,
			port: this.env.POSTGRES_PORT,
			user: this.env.POSTGRES_USER,
			password: this.env.POSTGRES_PASSWORD,
			database: this.env.POSTGRES_DB,
			url: this.env.DATABASE_URL,
		}
	}
}

export const config = new EnvConfig(process.env)
