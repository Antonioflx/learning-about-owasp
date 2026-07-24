import { Router } from 'express'
import * as protected_ from './controllers/protected.controller.js'
import * as vulnerable from './controllers/vulnerable.controller.js'
import { loginRateLimiter } from './middleware/rate-limiter.js'

export const router = Router()

// ─── Rotas Vulneráveis ────────────────────────────────────────────────────────
// Mensagens de erro distintas (enumeração de e-mail) + sem rate limit

router.post('/vulnerable/login', vulnerable.login)

// ─── Rotas Protegidas ─────────────────────────────────────────────────────────
// Mensagem genérica (fail securely) + rate limit por IP + bloqueio temporário por e-mail

router.post('/protected/login', loginRateLimiter, protected_.login)
