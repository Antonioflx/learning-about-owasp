import 'dotenv/config'
import { db } from './client.js'
import { seedUsers } from './seed/users.seed.js'

async function seed() {
	await seedUsers()

	await db.end()
	console.log('Seed concluído.')
}

seed().catch((err) => {
	console.error('Erro no seed:', err)
	process.exit(1)
})
