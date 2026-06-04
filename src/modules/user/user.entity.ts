type Role = 'admin' | 'user'

interface UserProps {
	id: string
	name: string
	email: string
	role: Role
	token?: string
}

export class UserEntity {
	readonly id: string
	readonly name: string
	readonly email: string
	readonly role: Role
	readonly token?: string

	private constructor(props: UserProps) {
		this.id = props.id
		this.name = props.name
		this.email = props.email
		this.role = props.role
		if (props.token !== undefined) this.token = props.token
	}

	isAdmin(): boolean {
		return this.role === 'admin'
	}

	isUser(): boolean {
		return this.role === 'user'
	}

	// DB garante name NOT NULL — campo obrigatório
	static fromDb(row: { id: string; name: string; email: string; role: string }): UserEntity {
		return new UserEntity({
			id: row.id,
			name: row.name,
			email: row.email,
			role: row.role as Role,
		})
	}

	static fromJwt(payload: { id: string; name: string; email: string; role: string }, token: string): UserEntity {
		return new UserEntity({
			id: payload.id,
			name: payload.name,
			email: payload.email,
			role: payload.role as Role,
			token,
		})
	}
}
