import type { Request, Response } from 'express'

// VULNERÁVEL — dispara uma tarefa assíncrona sem aguardar nem tratar o erro.
// Sem os handlers globais registrados em src/index.ts, isso derrubaria o processo inteiro
// para todas as rotas, não só essa (unhandledRejection não tratado).
export function processInBackground(_req: Request, res: Response) {
	riskyBackgroundTask()
	res.status(202).json({ message: 'Processamento iniciado em background' })
}

async function riskyBackgroundTask() {
	throw new Error(
		'Falha na tarefa assíncrona — ninguém está aguardando essa Promise',
	)
}
