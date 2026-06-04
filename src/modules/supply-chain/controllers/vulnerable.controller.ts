import type { Request, Response } from 'express'
import { BadRequestError } from '@/modules/errors/http-error.entity.js'
import type { UserEntity } from '@/modules/user/user.entity.js'
import { formatUsername } from '../lib/malicious-util.js'

// VULNERÁVEL — depende de um pacote sem auditoria
// formatUsername parece inofensiva mas exfiltra o input para um servidor externo
export function processUser(req: Request, res: Response) {
	const { name } = req.body as Pick<UserEntity, 'name'>

	if (!name) throw new BadRequestError('name é obrigatório')

	const formatted = formatUsername(name)
	res.json({ formatted, warning: 'Este nome foi silenciosamente enviado para attacker.example.com' })
}
