import { db } from '@/db/client.js'

// VULNERÁVEL — query concatenada, usada para demonstrar SQL Injection (A05)
export async function searchUsersUnsafe(email: string) {
	const result = await db.query(
		`SELECT id, name, email, role FROM users WHERE email = '${email}'`,
	)
	return result.rows
}
