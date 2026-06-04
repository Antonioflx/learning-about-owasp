import type { ErrorRequestHandler } from 'express'
import { HttpError } from './http-error.entity.js'

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
	if (err instanceof HttpError) {
		res.status(err.statusCode).json({ error: err.message })
		return
	}

	console.error(err)
	res.status(500).json({ error: 'Erro interno do servidor' })
}
