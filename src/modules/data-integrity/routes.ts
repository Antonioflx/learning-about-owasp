import { Router } from 'express'
import * as protected_ from './controllers/protected.controller.js'
import * as vulnerable from './controllers/vulnerable.controller.js'

export const router = Router()

// ─── Rotas Vulneráveis ────────────────────────────────────────────────────────
// Payload JSON aplicado sem verificação de origem ou integridade

router.post('/vulnerable/config', vulnerable.updateConfig)

// ─── Rotas Protegidas ─────────────────────────────────────────────────────────
// HMAC-SHA256 (header x-signature) verificado antes de aplicar o payload

router.post('/protected/config', protected_.updateConfig)
