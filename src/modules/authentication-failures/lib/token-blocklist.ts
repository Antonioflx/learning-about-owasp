class TokenBlocklist {
	private readonly revoked = new Set<string>()

	revoke(token: string): void {
		this.revoked.add(token)
	}

	isRevoked(token: string): boolean {
		return this.revoked.has(token)
	}
}

export const tokenBlocklist = new TokenBlocklist()
