import type { Request, Response } from 'express'
import { logger } from '@/config/logger.js'

// PROTEGIDO — aguarda a tarefa e trata o erro no próprio ponto onde ele acontece
export async function processInBackground(_req: Request, res: Response) {
	try {
		await riskyBackgroundTask()
	} catch (err) {
		logger.error({ err }, 'background_task_failed')
	}

	res.status(202).json({
		message: 'Processamento concluído — falha (se houve) tratada e registrada',
	})
}

async function riskyBackgroundTask() {
	throw new Error('Falha na tarefa assíncrona — mas alguém está tratando')
}
