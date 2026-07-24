import pg from 'pg'
import { config } from '@/config/env.config.js'

const { Pool } = pg

export const db = new Pool({
	host: config.database.host,
	port: config.database.port,
	user: config.database.user,
	password: config.database.password,
	database: config.database.database,
})
