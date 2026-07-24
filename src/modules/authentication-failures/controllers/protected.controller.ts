import bcrypt from 'bcrypt'
import type { Request, Response } from 'express'
import { SignJWT } from 'jose'
import { config } from '@/config/env.config.js'
import { UnauthorizedError } from '@/modules/errors/http-error.entity.js'
import { HttpResponse } from '@/modules/response/http-response.js'
import { findUserForAuth } from '@/modules/user/use-cases/find-user-for-auth.use-case.js'
import { getUserById } from '@/modules/user/use-cases/get-user.use-case.js'
import type { UserEntity } from '@/modules/user/user.entity.js'
import { refreshTokenStore } from '../lib/refresh-token.store.js'
import { tokenBlocklist } from '../lib/token-blocklist.js'

const secret = new TextEncoder().encode(config.jwtSecret)
const ACCESS_TOKEN_TTL = '15m'

function signAccessToken(
	user: Pick<UserEntity, 'id' | 'name' | 'email' | 'role'>,
) {
	return new SignJWT({
		id: user.id,
		name: user.name,
		email: user.email,
		role: user.role,
	})
		.setProtectedHeader({ alg: 'HS256' })
		.setExpirationTime(ACCESS_TOKEN_TTL)
		.sign(secret)
}

// PROTEGIDO — access token de vida curta (15min) + refresh token opaco de uso único
export async function login(req: Request, res: Response) {
	const { email, password } = req.body as { email: string; password: string }
	const result = await findUserForAuth(email)

	if (!result || !(await bcrypt.compare(password, result.passwordHash))) {
		throw new UnauthorizedError('Credenciais inválidas')
	}

	const accessToken = await signAccessToken(result.user)
	const refreshToken = refreshTokenStore.issue(result.user.id)

	new HttpResponse(res).ok({ accessToken, refreshToken })
}

// PROTEGIDO — troca um refresh token válido e não usado por um novo par de tokens
export async function refresh(req: Request, res: Response) {
	const { refreshToken } = req.body as { refreshToken: string }
	const userId = refreshTokenStore.consume(refreshToken)

	if (!userId)
		throw new UnauthorizedError(
			'Refresh token inválido, expirado ou já utilizado',
		)

	const user = await getUserById(userId)
	if (!user) throw new UnauthorizedError('Usuário não encontrado')

	const accessToken = await signAccessToken(user)
	const newRefreshToken = refreshTokenStore.issue(user.id)

	new HttpResponse(res).ok({ accessToken, refreshToken: newRefreshToken })
}

// PROTEGIDO — revoga o access token atual (blocklist) e o refresh token associado
export function logout(req: Request, res: Response) {
	const token = req.headers.authorization?.slice(7)
	if (token) tokenBlocklist.revoke(token)

	const { refreshToken } = req.body as { refreshToken?: string }
	if (refreshToken) refreshTokenStore.revoke(refreshToken)

	new HttpResponse(res).ok({ message: 'Logout efetuado — token revogado' })
}

export function profile(req: Request, res: Response) {
	new HttpResponse(res).ok<UserEntity>(req.user as UserEntity)
}
