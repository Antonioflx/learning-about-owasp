import type { Request, Response } from 'express'
import { z } from 'zod'
import { BadRequestError } from '@/modules/errors/http-error.entity.js'
import { HttpResponse } from '@/modules/response/http-response.js'
import { searchUsers as findUsers } from '@/modules/user/use-cases/search-users.use-case.js'

const emailSchema = z.object({
	email: z.string().email(),
})

// PROTEGIDO — zod valida o input; query parametrizada via use-case
export async function searchUsers(req: Request, res: Response) {
	const parsed = emailSchema.safeParse(req.query)

	if (!parsed.success) throw new BadRequestError(parsed.error.issues[0]?.message ?? 'Email inválido')

	const users = await findUsers(parsed.data.email)
	new HttpResponse(res).ok(users)
}
