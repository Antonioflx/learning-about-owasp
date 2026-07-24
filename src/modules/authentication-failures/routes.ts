import { Router } from 'express'
import * as protected_ from './controllers/protected.controller.js'
import * as vulnerable from './controllers/vulnerable.controller.js'
import { authGuard } from './middleware/index.js'

export const router = Router()

// ─── Rotas Vulneráveis ────────────────────────────────────────────────────────
// JWT sem expiração, logout que não revoga nada

router.post('/vulnerable/login', vulnerable.login)
router.post('/vulnerable/logout', vulnerable.logout)
router.get(
	'/vulnerable/profile',
	authGuard.verifyTokenInsecure,
	vulnerable.profile,
)

// ─── Rotas Protegidas ─────────────────────────────────────────────────────────
// Access token de 15min + refresh token de uso único + blocklist no logout

router.post('/protected/login', protected_.login)
router.post('/protected/refresh', protected_.refresh)
router.post('/protected/logout', authGuard.verifyTokenSecure, protected_.logout)
router.get(
	'/protected/profile',
	authGuard.verifyTokenSecure,
	protected_.profile,
)
