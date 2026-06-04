import { db } from '@/db/client.js'
import { UserEntity } from '../user.entity.js'

// Retorna a entidade (para claims do JWT) e o hash separado (para comparação)
// O hash nunca entra na entidade — ela não carrega dados sensíveis
export async function findUserForAuth(email: string): Promise<{ user: UserEntity; passwordHash: string } | null> {
	const result = await db.query(
		'SELECT id, name, email, password_hash, role FROM users WHERE email = $1',
		[email],
	)

	const row = result.rows[0]
	if (!row) return null

	return {
		user: UserEntity.fromDb(row),
		passwordHash: row.password_hash,
	}
}
