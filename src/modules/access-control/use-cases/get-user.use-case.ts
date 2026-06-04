import { db } from '@/db/client.js'
import { UserEntity } from '@/modules/user/user.entity.js'

export async function getUserById(id: string): Promise<UserEntity | null> {
	const result = await db.query(
		'SELECT id, name, email, role FROM users WHERE id = $1',
		[id],
	)

	if (!result.rows[0]) return null

	return UserEntity.fromDb(result.rows[0])
}
