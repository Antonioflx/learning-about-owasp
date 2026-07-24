import bcrypt from 'bcrypt'
import type { Request, Response } from 'express'
import { SignJWT } from 'jose'
import { config } from '@/config/env.config.js'
import { UnauthorizedError } from '@/modules/errors/http-error.entity.js'
import { HttpResponse } from '@/modules/response/http-response.js'
import { findUserForAuth } from '@/modules/user/use-cases/find-user-for-auth.use-case.js'
import type { UserEntity } from '@/modules/user/user.entity.js'

const secret = new TextEncoder().encode(config.jwtSecret)

// VULNERÁVEL — sem setExpirationTime: o token é válido para sempre
export async function login(req: Request, res: Response) {
	const { email, password } = req.body as { email: string; password: string }
	const result = await findUserForAuth(email)

	if (!result || !(await bcrypt.compare(password, result.passwordHash))) {
		throw new UnauthorizedError('Credenciais inválidas')
	}

	const { user } = result
	const token = await new SignJWT({
		id: user.id,
		name: user.name,
		email: user.email,
		role: user.role,
	})
		.setProtectedHeader({ alg: 'HS256' })
		.sign(secret)

	new HttpResponse(res).ok({ token })
}

// VULNERÁVEL — não revoga nada; o token segue funcionando normalmente depois do "logout"
export function logout(_req: Request, res: Response) {
	new HttpResponse(res).ok({
		message: 'Logout efetuado (mas o token continua válido)',
	})
}

// VULNERÁVEL — aceita qualquer token com assinatura válida, mesmo depois do "logout"
export function profile(req: Request, res: Response) {
	new HttpResponse(res).ok<UserEntity>(req.user as UserEntity)
}
