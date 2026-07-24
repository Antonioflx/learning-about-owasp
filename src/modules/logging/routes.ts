import { Router } from 'express'
import { pinoHttp } from 'pino-http'
import { logger } from '@/config/logger.js'
import * as protected_ from './controllers/protected.controller.js'
import * as vulnerable from './controllers/vulnerable.controller.js'

export const router = Router()

// ─── Rotas Vulneráveis ────────────────────────────────────────────────────────
// console.log solto, senha logada em texto puro, erros engolidos sem registro

router.post('/vulnerable/login', vulnerable.login)

// ─── Rotas Protegidas ─────────────────────────────────────────────────────────
// Logger estruturado (pino) por requisição + logs de tentativa de login e erros

router.use('/protected', pinoHttp({ logger }))
router.post('/protected/login', protected_.login)
