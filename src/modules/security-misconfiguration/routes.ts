import { Router } from 'express'
import { errorHandler } from '@/modules/errors/error.middleware.js'
import * as protected_ from './controllers/protected.controller.js'
import * as vulnerable from './controllers/vulnerable.controller.js'
import { protectedCors, secureHeaders, vulnerableCors, vulnerableErrorHandler } from './middleware/index.js'

export const router = Router()

// ─── Rotas Vulneráveis ────────────────────────────────────────────────────────
// Express defaults: X-Powered-By exposto, CORS aberto, stack trace no erro

router.use('/vulnerable', vulnerableCors)
router.get('/vulnerable/info', vulnerable.getInfo)
router.get('/vulnerable/error', vulnerable.triggerError)
router.use('/vulnerable', vulnerableErrorHandler)

// ─── Rotas Protegidas ─────────────────────────────────────────────────────────
// helmet + CORS restrito + handler de erro genérico

router.use('/protected', secureHeaders, protectedCors)
router.get('/protected/info', protected_.getInfo)
router.get('/protected/error', protected_.triggerError)
router.use('/protected', errorHandler)
