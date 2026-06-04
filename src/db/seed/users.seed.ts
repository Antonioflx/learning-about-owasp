import { db } from '../client.js'

// senhas em texto puro aqui só para seed — hashing será demonstrado na task A04
const users = [
	{ name: 'Alice Admin', email: 'alice@example.com', password_hash: 'hashed_admin_pass', role: 'admin' },
	{ name: 'Bob User', email: 'bob@example.com', password_hash: 'hashed_user_pass', role: 'user' },
	{ name: 'Carol User', email: 'carol@example.com', password_hash: 'hashed_user_pass', role: 'user' },
]

export async function seedUsers() {
	for (const user of users) {
		await db.query(
			`INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO NOTHING`,
			[user.name, user.email, user.password_hash, user.role],
		)
		console.log(`✓ ${user.email}`)
	}
}
