import { Router } from 'express'
import * as protected_ from './controllers/protected.controller.js'
import * as vulnerable from './controllers/vulnerable.controller.js'

export const router = Router()

// ─── Rotas Vulneráveis ────────────────────────────────────────────────────────
// SQL Injection via concatenação de string

router.get('/vulnerable/users', vulnerable.searchUsers)

// ─── Rotas Protegidas ─────────────────────────────────────────────────────────
// Query parametrizada + validação zod

router.get('/protected/users', protected_.searchUsers)
