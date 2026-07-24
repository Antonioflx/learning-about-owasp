import { randomBytes } from 'node:crypto'

class RefreshTokenStore {
	private readonly tokens = new Map<string, string>()

	issue(userId: string): string {
		const token = randomBytes(32).toString('hex')
		this.tokens.set(token, userId)
		return token
	}

	// Uso único — consumir invalida o refresh token, mesmo que roubado
	consume(token: string): string | null {
		const userId = this.tokens.get(token)
		if (!userId) return null
		this.tokens.delete(token)
		return userId
	}

	revoke(token: string): void {
		this.tokens.delete(token)
	}
}

export const refreshTokenStore = new RefreshTokenStore()
