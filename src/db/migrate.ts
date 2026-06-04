import 'dotenv/config'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { db } from './client.js'

const migrationsDir = join(import.meta.dirname, 'migrations')

const migrations = ['001_create_users.sql']

async function migrate() {
	for (const file of migrations) {
		const sql = readFileSync(join(migrationsDir, file), 'utf-8')
		await db.query(sql)
		console.log(`✓ ${file}`)
	}

	await db.end()
	console.log('Migration concluída.')
}

migrate().catch((err) => {
	console.error('Erro na migration:', err)
	process.exit(1)
})
