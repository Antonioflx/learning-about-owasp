import type { UserEntity } from '@/modules/user/user.entity.js'

declare global {
	namespace Express {
		interface Request {
			user?: UserEntity
		}
	}
}
