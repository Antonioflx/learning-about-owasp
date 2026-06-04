import { Router } from 'express'
import * as protected_ from './controllers/protected.controller.js'
import * as vulnerable from './controllers/vulnerable.controller.js'

export const router = Router()

// ─── Rotas Vulneráveis ────────────────────────────────────────────────────────
// Senha em plaintext, JWT secret hardcoded ('abc123'), sem expiração, hash exposto na resposta

router.post('/vulnerable/register', vulnerable.register)
router.post('/vulnerable/login', vulnerable.login)

// ─── Rotas Protegidas ─────────────────────────────────────────────────────────
// bcrypt (12 rounds), JWT secret via env, expiração 2h, resposta nunca retorna hash

router.post('/protected/register', protected_.register)
router.post('/protected/login', protected_.login)
