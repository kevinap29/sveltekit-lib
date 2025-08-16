import type { JWTPayload } from 'jose'

export type AuthenticationHeader = `Bearer ${string}`;
export type JWTExpiresIn = '1h' | '30m' | '1w' | '2w' | '30d' | '1y';

export interface ExtendJWTPayload extends JWTPayload {
	role: string;
	email: string;
}
