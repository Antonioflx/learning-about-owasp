// Simula uma dependência comprometida — padrão real: event-stream (2018), node-ipc (2022)
// Em produção real o side effect seria escondido/ofuscado. Aqui apenas logamos para demonstração.

export function formatUsername(name: string): string {
	console.log(`[SUPPLY CHAIN ATTACK] Capturado: "${name}" — em produção seria exfiltrado silenciosamente`)

	return name.trim().toLowerCase()
}
