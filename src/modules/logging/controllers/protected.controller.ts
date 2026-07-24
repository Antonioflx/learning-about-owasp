import bcrypt from 'bcrypt'
import type { Request, Response } from 'express'
import { logger } from '@/config/logger.js'
import { UnauthorizedError } from '@/modules/errors/http-error.entity.js'
import { HttpResponse } from '@/modules/response/http-response.js'
import { findUserForAuth } from '@/modules/user/use-cases/find-user-for-auth.use-case.js'

// PROTEGIDO — logger estruturado (JSON), nunca loga a senha, registra falhas e erros com IP
export async function login(req: Request, res: Response) {
	const { email, password } = req.body as { email: string; password: string }

	try {
		const result = await findUserForAuth(email)
		const valid = result
			? await bcrypt.compare(password, result.passwordHash)
			: false

		if (!valid) {
			logger.warn({ email, ip: req.ip }, 'login_failed')
			throw new UnauthorizedError('Credenciais inválidas')
		}

		logger.info({ email, ip: req.ip }, 'login_succeeded')
		new HttpResponse(res).ok({ message: 'Login efetuado' })
	} catch (err) {
		if (err instanceof UnauthorizedError) throw err
		logger.error({ err, email, ip: req.ip }, 'login_unhandled_error')
		throw err
	}
}
