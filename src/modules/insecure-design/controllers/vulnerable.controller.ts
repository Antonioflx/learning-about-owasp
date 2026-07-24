import bcrypt from 'bcrypt'
import type { Request, Response } from 'express'
import { UnauthorizedError } from '@/modules/errors/http-error.entity.js'
import { HttpResponse } from '@/modules/response/http-response.js'
import { findUserForAuth } from '@/modules/user/use-cases/find-user-for-auth.use-case.js'

// VULNERÁVEL — mensagens distintas revelam se o e-mail existe (user enumeration); sem rate limit
export async function login(req: Request, res: Response) {
	const { email, password } = req.body as { email: string; password: string }
	const result = await findUserForAuth(email)

	if (!result) throw new UnauthorizedError('Email não encontrado')
	if (!(await bcrypt.compare(password, result.passwordHash)))
		throw new UnauthorizedError('Senha incorreta')

	new HttpResponse(res).ok({ message: 'Login efetuado' })
}
