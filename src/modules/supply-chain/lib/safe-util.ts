// Versão auditada — faz apenas o que declara, sem side effects
export function formatUsername(name: string): string {
	return name.trim().toLowerCase()
}
