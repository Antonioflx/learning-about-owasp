import type { Request, Response } from 'express'
import { config } from '@/config/env.config.js'
import { UnauthorizedError } from '@/modules/errors/http-error.entity.js'
import { HttpResponse } from '@/modules/response/http-response.js'
import { verify } from '../lib/hmac.js'

// PROTEGIDO — só aplica o payload se a assinatura HMAC (header x-signature) bater
export function updateConfig(req: Request, res: Response) {
	const signature = req.headers['x-signature']
	const payload = req.body as Record<string, unknown>

	if (
		typeof signature !== 'string' ||
		!verify(payload, signature, config.integritySecret)
	) {
		throw new UnauthorizedError('Assinatura inválida — payload rejeitado')
	}

	new HttpResponse(res).ok({
		message: 'Configuração aplicada — assinatura verificada',
		applied: payload,
	})
}
