import rateLimit from 'express-rate-limit'
import { TooManyRequestsError } from '@/modules/errors/http-error.entity.js'

// PROTEGIDO — limita tentativas de login por IP, independente do e-mail usado
export const loginRateLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	limit: 5,
	standardHeaders: true,
	legacyHeaders: false,
	handler: () => {
		throw new TooManyRequestsError(
			'Muitas tentativas de login a partir deste IP — aguarde 15 minutos',
		)
	},
})
