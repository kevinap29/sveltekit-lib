export type AuthenticationHeader = `Bearer ${string}`;
export type JWTExpiresIn = '1h' | '30m' | '1w' | '2w' | '30d' | '1y';
export type JWTRole = 'root' | 'admin' | 'user';

export interface ExtendJWTPayload {
	role: JWTRole;
	email: string;
}
