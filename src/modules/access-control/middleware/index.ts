import type { NextFunction, Request, Response } from 'express'
import { jwtVerify } from 'jose'
import { ForbiddenError, UnauthorizedError } from '@/modules/errors/http-error.entity.js'
import { UserEntity } from '@/modules/user/user.entity.js'

const secret = new TextEncoder().encode(process.env.JWT_SECRET)

export async function verifyToken(req: Request, _res: Response, next: NextFunction) {
	const header = req.headers.authorization

	if (!header?.startsWith('Bearer ')) throw new UnauthorizedError('Token ausente')

	const token = header.slice(7)

	try {
		const { payload } = await jwtVerify(token, secret)
		req.user = UserEntity.fromJwt(payload as { id: string; email: string; role: string }, token)
		next()
	} catch {
		throw new UnauthorizedError('Token inválido')
	}
}

export function requireRole(check: (user: UserEntity) => boolean) {
	return (req: Request, _res: Response, next: NextFunction) => {
		if (!req.user || !check(req.user)) throw new ForbiddenError('Acesso negado: privilégio insuficiente')
		next()
	}
}

// Compara req.user.id (payload do JWT) com req.params.id (ID na URL)
export function verifyOwnership(req: Request, _res: Response, next: NextFunction) {
	if (req.user?.id !== req.params.id) throw new ForbiddenError('Acesso negado: você não pode acessar dados de outro usuário')
	next()
}
