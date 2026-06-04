import { Router } from 'express'
import { SignJWT } from 'jose'
import { db } from '@/db/client.js'
import * as protected_ from './controllers/protected.controller.js'
import * as vulnerable from './controllers/vulnerable.controller.js'
import { requireRole, verifyOwnership, verifyToken } from './middleware/index.js'

export const router = Router()

const secret = new TextEncoder().encode(process.env.JWT_SECRET)

// Login — emite token com id, email e role do usuário
// Sem verificação de senha (foco é no A01, não em crypto — isso é A04)
router.post('/login', async (req, res) => {
	const { email } = req.body as { email: string }

	const result = await db.query(
		'SELECT id, name, email, role FROM users WHERE email = $1',
		[email],
	)

	const user = result.rows[0]

	if (!user) {
		res.status(404).json({ error: 'Usuário não encontrado' })
		return
	}

	const token = await new SignJWT({
		id: user.id,
		name: user.name,
		email: user.email,
		role: user.role,
	})
		.setProtectedHeader({ alg: 'HS256' })
		.setExpirationTime('2h')
		.sign(secret)

	res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } })
})

// ─── Rotas Vulneráveis ────────────────────────────────────────────────────────
// verifyToken presente (usuário autenticado), mas sem verificar QUEM pode acessar O QUÊ

router.get('/vulnerable/users/:id', verifyToken, vulnerable.getUser)
router.delete('/vulnerable/admin/users/:id', verifyToken, vulnerable.deleteUser)

// ─── Rotas Protegidas ─────────────────────────────────────────────────────────
// verifyToken + middleware de autorização específico por rota

router.get(
	'/protected/users/:id',
	verifyToken,
	verifyOwnership,
	protected_.getUser,
)
router.delete(
	'/protected/admin/users/:id',
	verifyToken,
	requireRole(user => user.isAdmin()),
	protected_.deleteUser,
)
