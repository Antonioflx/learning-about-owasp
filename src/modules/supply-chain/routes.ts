import { Router } from 'express'
import * as protected_ from './controllers/protected.controller.js'
import * as vulnerable from './controllers/vulnerable.controller.js'

export const router = Router()

// ─── Rotas Vulneráveis ────────────────────────────────────────────────────────
// Usa lib sem auditoria — side effect de exfiltração escondido

router.post('/vulnerable/process', vulnerable.processUser)

// ─── Rotas Protegidas ─────────────────────────────────────────────────────────
// Usa lib auditada — lockfile fixado + npm audit no CI

router.post('/protected/process', protected_.processUser)
