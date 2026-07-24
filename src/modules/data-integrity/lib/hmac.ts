import { createHmac, timingSafeEqual } from 'node:crypto'

export function sign(payload: unknown, secret: string): string {
	return createHmac('sha256', secret)
		.update(JSON.stringify(payload))
		.digest('hex')
}

export function verify(
	payload: unknown,
	signature: string,
	secret: string,
): boolean {
	const expected = Buffer.from(sign(payload, secret), 'hex')
	const received = Buffer.from(signature, 'hex')

	if (expected.length !== received.length) return false
	return timingSafeEqual(expected, received)
}
