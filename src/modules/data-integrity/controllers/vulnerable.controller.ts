import type { Request, Response } from 'express'
import { HttpResponse } from '@/modules/response/http-response.js'

// VULNERÁVEL — aplica o payload recebido sem verificar origem ou integridade
// Em um sistema real, isso poderia alterar configs, permissões ou preços vindos de qualquer remetente
export function updateConfig(req: Request, res: Response) {
	const payload = req.body as Record<string, unknown>
	new HttpResponse(res).ok({
		message: 'Configuração aplicada sem verificação de integridade',
		applied: payload,
	})
}
