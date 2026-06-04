import { db } from '@/db/client.js'

export async function registerUser(data: { name: string; email: string; passwordHash: string }): Promise<void> {
	await db.query(
		'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4)',
		[data.name, data.email, data.passwordHash, 'user'],
	)
}
