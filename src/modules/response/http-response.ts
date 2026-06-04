import type { Response } from 'express'

export class HttpResponse {
	constructor(private readonly res: Response) {}

	ok<T>(data?: T): void {
		this.res.status(200).json(data)
	}

	created<T>(data?: T): void {
		this.res.status(201).json(data)
	}

	noContent(): void {
		this.res.status(204).end()
	}
}
