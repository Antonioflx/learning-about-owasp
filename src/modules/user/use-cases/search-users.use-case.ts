import { db } from '@/db/client.js'
import { UserEntity } from '../user.entity.js'

export async function searchUsers(email: string): Promise<UserEntity[]> {
	const result = await db.query(
		'SELECT id, name, email, role FROM users WHERE email = $1',
		[email],
	)
	return result.rows.map((row: { id: string; name: string; email: string; role: string }) => UserEntity.fromDb(row))
}
