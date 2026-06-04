import type { Request, Response } from 'express'
import { HttpResponse } from '@/modules/response/http-response.js'
import { searchUsersUnsafe } from '@/modules/user/use-cases/search-users-unsafe.use-case.js'

// VULNERÁVEL — SQL Injection: email concatenado direto na query
// Payload: ' OR '1'='1  → retorna todos os usuários
export async function searchUsers(req: Request, res: Response) {
	const { email } = req.query as { email: string }
	const users = await searchUsersUnsafe(email)
	new HttpResponse(res).ok(users)
}
