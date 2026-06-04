import bcrypt from 'bcrypt'
import type { Request, Response } from 'express'
import { SignJWT } from 'jose'
import { UnauthorizedError } from '@/modules/errors/http-error.entity.js'
import { HttpResponse } from '@/modules/response/http-response.js'
import { findUserForAuth } from '@/modules/user/use-cases/find-user-for-auth.use-case.js'
import { registerUser } from '@/modules/user/use-cases/register-user.use-case.js'

const SALT_ROUNDS = 12
const secret = new TextEncoder().encode(process.env.JWT_SECRET)

// PROTEGIDO — bcrypt gera hash irreversível com salt aleatório
export async function register(req: Request, res: Response) {
	const { name, email, password } = req.body as { name: string; email: string; password: string }
	const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)
	await registerUser({ name, email, passwordHash })
	new HttpResponse(res).created<{ message: string }>({ message: 'Usuário criado' })
}

// PROTEGIDO — bcrypt.compare, JWT via env, expiração 2h, nunca retorna hash
export async function login(req: Request, res: Response) {
	const { email, password } = req.body as { email: string; password: string }
	const result = await findUserForAuth(email)

	if (!result || !(await bcrypt.compare(password, result.passwordHash))) {
		throw new UnauthorizedError('Credenciais inválidas')
	}

	const { user } = result
	const token = await new SignJWT({ id: user.id, name: user.name, email: user.email, role: user.role })
		.setProtectedHeader({ alg: 'HS256' })
		.setExpirationTime('2h')
		.sign(secret)

	new HttpResponse(res).ok<{ token: string }>({ token })
}
