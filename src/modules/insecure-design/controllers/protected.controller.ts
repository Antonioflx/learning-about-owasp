import bcrypt from 'bcrypt'
import type { Request, Response } from 'express'
import {
	TooManyRequestsError,
	UnauthorizedError,
} from '@/modules/errors/http-error.entity.js'
import { HttpResponse } from '@/modules/response/http-response.js'
import { findUserForAuth } from '@/modules/user/use-cases/find-user-for-auth.use-case.js'
import { loginAttemptsStore } from '../lib/login-attempts.store.js'

// PROTEGIDO — mensagem genérica (fail securely) + bloqueio temporário por e-mail após 5 falhas
export async function login(req: Request, res: Response) {
	const { email, password } = req.body as { email: string; password: string }

	if (loginAttemptsStore.isLocked(email)) {
		throw new TooManyRequestsError(
			'Conta temporariamente bloqueada por excesso de tentativas — aguarde 1 minuto',
		)
	}

	const result = await findUserForAuth(email)
	const valid = result
		? await bcrypt.compare(password, result.passwordHash)
		: false

	if (!valid) {
		loginAttemptsStore.registerFailure(email)
		throw new UnauthorizedError('Email ou senha incorretos')
	}

	loginAttemptsStore.reset(email)
	new HttpResponse(res).ok({ message: 'Login efetuado' })
}
