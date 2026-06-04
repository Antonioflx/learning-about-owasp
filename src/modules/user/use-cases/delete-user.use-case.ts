import { db } from '@/db/client.js'

export async function deleteUserById(id: string) {
	const result = await db.query(
		'DELETE FROM users WHERE id = $1 RETURNING id',
		[id],
	)
	return result.rows[0] ?? null
}
