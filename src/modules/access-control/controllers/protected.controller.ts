import type { Request, Response } from 'express'
import { NotFoundError } from '@/modules/errors/http-error.entity.js'
import { deleteUserById } from '../use-cases/delete-user.use-case.js'
import { getUserById } from '../use-cases/get-user.use-case.js'

// verifyOwnership middleware garante req.user.id === params.id antes de chegar aqui
export async function getUser(req: Request<{ id: string }>, res: Response) {
	const user = await getUserById(req.params.id)

	if (!user) throw new NotFoundError('Usuário não encontrado')

	res.json(user)
}

// requireRole('admin') middleware bloqueia qualquer não-admin com 403 antes de chegar aqui
export async function deleteUser(req: Request<{ id: string }>, res: Response) {
	const deleted = await deleteUserById(req.params.id)

	if (!deleted) throw new NotFoundError('Usuário não encontrado')

	res.json({ message: `Usuário ${req.params.id} deletado` })
}
