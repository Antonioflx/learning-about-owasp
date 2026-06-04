import type { Request, Response } from 'express'

// PROTEGIDO — helmet remove X-Powered-By e adiciona headers de segurança; CORS restrito
export function getInfo(_req: Request, res: Response) {
	res.json({
		message: 'Rota protegida — inspecione os headers da resposta',
		hint: 'X-Powered-By ausente; headers CSP, HSTS e X-Frame-Options presentes',
	})
}

// PROTEGIDO — erro genérico em produção (stack trace nunca chega ao cliente)
export function triggerError(_req: Request, _res: Response): never {
	throw new Error('Falha interna simulada — detalhes ficam no servidor')
}
