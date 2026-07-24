import NodeCache from 'node-cache'

const MAX_ATTEMPTS = 5
const LOCK_TTL_SECONDS = 60

class LoginAttemptsStore {
	private readonly cache = new NodeCache({ stdTTL: LOCK_TTL_SECONDS })

	isLocked(email: string): boolean {
		return (this.cache.get<number>(email) ?? 0) >= MAX_ATTEMPTS
	}

	registerFailure(email: string): void {
		const attempts = (this.cache.get<number>(email) ?? 0) + 1
		this.cache.set(email, attempts)
	}

	reset(email: string): void {
		this.cache.del(email)
	}
}

export const loginAttemptsStore = new LoginAttemptsStore()
