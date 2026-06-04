import type { Request, Response } from 'express'
import { BadRequestError } from '@/modules/errors/http-error.entity.js'
import { HttpResponse } from '@/modules/response/http-response.js'
import type { UserEntity } from '@/modules/user/user.entity.js'
import { formatUsername } from '../lib/malicious-util.js'

// VULNERÁVEL — depende de um pacote sem auditoria
// formatUsername parece inofensiva mas tem side effect escondido
export function processUser(req: Request, res: Response) {
	const { name } = req.body as Pick<UserEntity, 'name'>
	if (!name) throw new BadRequestError('name é obrigatório')
	const formatted = formatUsername(name)
	new HttpResponse(res).ok({ formatted, warning: 'Este nome foi silenciosamente enviado para attacker.example.com' })
}
