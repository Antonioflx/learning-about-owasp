import { Router } from 'express'
import * as protected_ from './controllers/protected.controller.js'
import * as vulnerable from './controllers/vulnerable.controller.js'

export const router = Router()

// ─── Rotas Vulneráveis ────────────────────────────────────────────────────────
// Promise disparada sem await/catch — gera unhandledRejection não tratado

router.post('/vulnerable/process', vulnerable.processInBackground)

// ─── Rotas Protegidas ─────────────────────────────────────────────────────────
// try/catch ao redor da operação assíncrona + log estruturado do erro

router.post('/protected/process', protected_.processInBackground)
