import type { Request, Response } from 'express'
import { SignJWT } from 'jose'
import { UnauthorizedError } from '@/modules/errors/http-error.entity.js'
import { HttpResponse } from '@/modules/response/http-response.js'
import { findUserForAuth } from '@/modules/user/use-cases/find-user-for-auth.use-case.js'
import { registerUser } from '@/modules/user/use-cases/register-user.use-case.js'

// VULNERÁVEL — secret hardcoded: qualquer um que leia o fonte consegue forjar tokens
const WEAK_SECRET = new TextEncoder().encode('abc123')

// VULNERÁVEL — passwordHash recebe a senha em texto puro
export async function register(req: Request, res: Response) {
	const { name, email, password } = req.body as { name: string; email: string; password: string }
	await registerUser({ name, email, passwordHash: password })
	new HttpResponse(res).created({ message: 'Usuário criado', password_stored_as: password })
}

// VULNERÁVEL — compara plaintext, JWT sem expiração, secret fraco, expõe hash na resposta
export async function login(req: Request, res: Response) {
	const { email, password } = req.body as { email: string; password: string }
	const result = await findUserForAuth(email)

	if (!result || result.passwordHash !== password) throw new UnauthorizedError('Credenciais inválidas')

	const { user } = result
	const token = await new SignJWT({ id: user.id, name: user.name, email: user.email, role: user.role })
		.setProtectedHeader({ alg: 'HS256' })
		.sign(WEAK_SECRET)

	// VULNERÁVEL — expõe o hash (que aqui é plaintext) na resposta
	new HttpResponse(res).ok({ token, password_hash: result.passwordHash })
}
