import 'dotenv/config'
import express from 'express'
import swaggerUi from 'swagger-ui-express'
import { swaggerSpec } from '@/docs/swagger.js'
import { router as accessControlRouter } from '@/modules/access-control/routes.js'
import { errorHandler } from '@/modules/errors/error.middleware.js'

const app = express()

app.use(express.json())

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.use('/a01', accessControlRouter)

app.use(errorHandler)

app.listen(3000, () => {
	console.log('Rodando 🚀')
	console.log('Docs: http://localhost:3000/docs')
})
