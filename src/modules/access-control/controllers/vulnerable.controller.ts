import type { Request, Response } from 'express'
import { NotFoundError } from '@/modules/errors/http-error.entity.js'
import { deleteUserById } from '../use-cases/delete-user.use-case.js'
import { getUserById } from '../use-cases/get-user.use-case.js'

// VULNERÁVEL — IDOR: sem verifyOwnership, qualquer usuário autenticado acessa dados de outro
export async function getUser(req: Request<{ id: string }>, res: Response) {
	const user = await getUserById(req.params.id)

	if (!user) throw new NotFoundError('Usuário não encontrado')

	res.json(user)
}

// VULNERÁVEL — sem requireRole: qualquer usuário autenticado pode deletar outro
export async function deleteUser(req: Request<{ id: string }>, res: Response) {
	await deleteUserById(req.params.id)
	res.json({ message: `Usuário ${req.params.id} deletado` })
}
