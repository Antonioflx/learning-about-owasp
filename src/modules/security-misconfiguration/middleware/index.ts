import cors from 'cors'
import type { ErrorRequestHandler } from 'express'
import helmet from 'helmet'

// VULNERÁVEL — CORS aberto: qualquer origem pode fazer requisições
export const vulnerableCors = cors()

// PROTEGIDO — CORS restrito a origens conhecidas
export const protectedCors = cors({
	origin: process.env.ALLOWED_ORIGIN ?? 'http://localhost:3000',
	methods: ['GET', 'POST', 'DELETE'],
})

// PROTEGIDO — helmet configura ~15 headers de segurança:
// remove X-Powered-By, adiciona CSP, HSTS, X-Frame-Options, etc.
export const secureHeaders = helmet()

// VULNERÁVEL — handler de erro que vaza stack trace, path e método
export const vulnerableErrorHandler: ErrorRequestHandler = (err, req, res, _next) => {
	res.status(500).json({
		error: err.message,
		stack: err.stack,
		path: req.path,
		method: req.method,
	})
}
