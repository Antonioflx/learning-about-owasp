import type { Request, Response } from 'express'

// VULNERÁVEL — X-Powered-By: Express exposto, CORS aberto
export function getInfo(_req: Request, res: Response) {
	res.json({
		message: 'Rota vulnerável — inspecione os headers da resposta',
		hint: 'X-Powered-By revela a stack; Access-Control-Allow-Origin aceita qualquer origem',
	})
}

// VULNERÁVEL — erro retorna stack trace completo ao cliente
export function triggerError(_req: Request, _res: Response): never {
	throw new Error('Falha interna simulada — detalhes do servidor expostos')
}
