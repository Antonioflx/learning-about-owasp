import type { NextFunction, Request, Response } from 'express'
import { jwtVerify } from 'jose'
import { config } from '@/config/env.config.js'
import {
	ForbiddenError,
	UnauthorizedError,
} from '@/modules/errors/http-error.entity.js'
import { UserEntity } from '@/modules/user/user.entity.js'

// Guard: decide se a requisição segue adiante antes de chegar no controller
class AccessControlGuard {
	private readonly secret = new TextEncoder().encode(config.jwtSecret)

	// Propriedades como arrow function para preservar o `this` ao serem usadas como middleware do Express
	verifyToken = async (req: Request, _res: Response, next: NextFunction) => {
		const header = req.headers.authorization

		if (!header?.startsWith('Bearer '))
			throw new UnauthorizedError('Token ausente')

		const token = header.slice(7)

		try {
			const { payload } = await jwtVerify(token, this.secret)
			req.user = UserEntity.fromJwt(
				payload as { id: string; name: string; email: string; role: string },
				token,
			)
			next()
		} catch {
			throw new UnauthorizedError('Token inválido')
		}
	}

	requireRole = (check: (user: UserEntity) => boolean) => {
		return (req: Request, _res: Response, next: NextFunction) => {
			if (!req.user || !check(req.user))
				throw new ForbiddenError('Acesso negado: privilégio insuficiente')
			next()
		}
	}

	// Compara req.user.id (payload do JWT) com req.params.id (ID na URL)
	verifyOwnership = (req: Request, _res: Response, next: NextFunction) => {
		if (req.user?.id !== req.params.id)
			throw new ForbiddenError('Acesso negado')
		next()
	}
}

export const accessControlGuard = new AccessControlGuard()
