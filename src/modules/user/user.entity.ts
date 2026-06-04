type Role = 'admin' | 'user'

interface UserProps {
	id: string
	email: string
	role: Role
	name?: string
	token?: string
}

export class UserEntity {
	readonly id: string
	readonly email: string
	readonly role: Role
	readonly name?: string
	readonly token?: string

	private constructor(props: UserProps) {
		this.id = props.id
		this.email = props.email
		this.role = props.role
		if (props.name !== undefined) this.name = props.name
		if (props.token !== undefined) this.token = props.token
	}

	isAdmin(): boolean {
		return this.role === 'admin'
	}

	isUser(): boolean {
		return this.role === 'user'
	}

	static fromDb(row: { id: string; email: string; role: string; name?: string }): UserEntity {
		return new UserEntity({
			id: row.id,
			email: row.email,
			role: row.role as Role,
			...(row.name !== undefined && { name: row.name }),
		})
	}

	static fromJwt(payload: { id: string; email: string; role: string }, token: string): UserEntity {
		return new UserEntity({
			id: payload.id,
			email: payload.email,
			role: payload.role as Role,
			token,
		})
	}
}
