import type { NextFunction, Request, Response } from 'express'
import { jwtVerify } from 'jose'
import { config } from '@/config/env.config.js'
import { UnauthorizedError } from '@/modules/errors/http-error.entity.js'
import { UserEntity } from '@/modules/user/user.entity.js'
import { tokenBlocklist } from '../lib/token-blocklist.js'

// Guard: valida o access token nas rotas de A07
class AuthGuard {
	private readonly secret = new TextEncoder().encode(config.jwtSecret)

	// VULNERÁVEL — só verifica a assinatura; ignora se o token foi revogado no "logout"
	verifyTokenInsecure = async (
		req: Request,
		_res: Response,
		next: NextFunction,
	) => {
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

	// PROTEGIDO — além da assinatura, checa a blocklist antes de aceitar o token
	verifyTokenSecure = async (
		req: Request,
		_res: Response,
		next: NextFunction,
	) => {
		const header = req.headers.authorization
		if (!header?.startsWith('Bearer '))
			throw new UnauthorizedError('Token ausente')

		const token = header.slice(7)
		if (tokenBlocklist.isRevoked(token))
			throw new UnauthorizedError('Token revogado')

		try {
			const { payload } = await jwtVerify(token, this.secret)
			req.user = UserEntity.fromJwt(
				payload as { id: string; name: string; email: string; role: string },
				token,
			)
			next()
		} catch {
			throw new UnauthorizedError('Token inválido ou expirado')
		}
	}
}

export const authGuard = new AuthGuard()
