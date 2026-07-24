import 'dotenv/config'
import express from 'express'
import swaggerUi from 'swagger-ui-express'
import { config } from '@/config/env.config.js'
import { logger } from '@/config/logger.js'
import { db } from '@/db/client.js'
import { swaggerSpec } from '@/docs/swagger.js'
import { router as accessControlRouter } from '@/modules/access-control/routes.js'
import { router as authenticationFailuresRouter } from '@/modules/authentication-failures/routes.js'
import { router as cryptographicFailuresRouter } from '@/modules/cryptographic-failures/routes.js'
import { router as dataIntegrityRouter } from '@/modules/data-integrity/routes.js'
import { errorHandler } from '@/modules/errors/error.middleware.js'
import { router as exceptionalConditionsRouter } from '@/modules/exceptional-conditions/routes.js'
import { router as injectionRouter } from '@/modules/injection/routes.js'
import { router as insecureDesignRouter } from '@/modules/insecure-design/routes.js'
import { router as loggingRouter } from '@/modules/logging/routes.js'
import { router as securityMisconfigurationRouter } from '@/modules/security-misconfiguration/routes.js'
import { router as supplyChainRouter } from '@/modules/supply-chain/routes.js'

// A10 — sem isso, uma Promise rejeitada e não tratada (ver /a10/vulnerable/process) derruba o processo inteiro
process.on('unhandledRejection', (reason) => {
	logger.error({ err: reason }, 'unhandled_rejection')
})

// A10 — estado do processo é indefinido após uma exceção não capturada; loga e encerra de forma controlada
process.on('uncaughtException', (err) => {
	logger.fatal({ err }, 'uncaught_exception')
	process.exit(1)
})

const app = express()

app.use(express.json())

app.get('/health', async (_req, res) => {
	try {
		await db.query('SELECT 1')
		res.status(200).json({ status: 'ok' })
	} catch {
		res.status(503).json({ status: 'unavailable' })
	}
})

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.use('/a01', accessControlRouter)
app.use('/a02', securityMisconfigurationRouter)
app.use('/a03', supplyChainRouter)
app.use('/a04', cryptographicFailuresRouter)
app.use('/a05', injectionRouter)
app.use('/a06', insecureDesignRouter)
app.use('/a07', authenticationFailuresRouter)
app.use('/a08', dataIntegrityRouter)
app.use('/a09', loggingRouter)
app.use('/a10', exceptionalConditionsRouter)

app.use(errorHandler)

app.listen(config.port, () => {
	console.log('Rodando 🚀')
	console.log(`Docs: http://localhost:${config.port}/docs`)
})
