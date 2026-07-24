import bcrypt from 'bcrypt'
import type { Request, Response } from 'express'
import { findUserForAuth } from '@/modules/user/use-cases/find-user-for-auth.use-case.js'

// VULNERÁVEL — console.log genérico, loga a senha em texto puro, erros engolidos sem registro
export async function login(req: Request, res: Response) {
	const { email, password } = req.body as { email: string; password: string }

	// VULNERÁVEL — nunca logue senhas, nem em debug
	console.log('Tentativa de login:', email, password)

	try {
		const result = await findUserForAuth(email)
		const valid = result
			? await bcrypt.compare(password, result.passwordHash)
			: false

		if (!valid) {
			// VULNERÁVEL — falha de autenticação não fica registrada em lugar nenhum
			res.status(401).json({ error: 'Credenciais inválidas' })
			return
		}

		res.status(200).json({ message: 'Login efetuado' })
	} catch {
		// VULNERÁVEL — erro engolido em silêncio: impossível detectar ou investigar depois
		res.status(500).json({ error: 'Erro interno' })
	}
}
