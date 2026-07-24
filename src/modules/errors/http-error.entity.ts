export class HttpError extends Error {
	readonly statusCode: number

	constructor(statusCode: number, message: string) {
		super(message)
		this.name = this.constructor.name
		this.statusCode = statusCode
	}
}

export class BadRequestError extends HttpError {
	constructor(message = 'Requisição inválida') {
		super(400, message)
	}
}

export class UnauthorizedError extends HttpError {
	constructor(message = 'Token ausente ou inválido') {
		super(401, message)
	}
}

export class ForbiddenError extends HttpError {
	constructor(message = 'Acesso negado') {
		super(403, message)
	}
}

export class NotFoundError extends HttpError {
	constructor(message = 'Recurso não encontrado') {
		super(404, message)
	}
}

export class TooManyRequestsError extends HttpError {
	constructor(message = 'Muitas tentativas — tente novamente mais tarde') {
		super(429, message)
	}
}
