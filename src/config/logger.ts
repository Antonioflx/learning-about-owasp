import pino from 'pino'
import { config } from './env.config.js'

export const logger = pino({
	level: config.isProduction ? 'info' : 'debug',
	redact: ['password', 'req.body.password', 'req.body.passwordHash'],
})
