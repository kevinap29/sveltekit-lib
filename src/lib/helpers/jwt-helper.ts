import type { ExtendJWTPayload, JWTExpiresIn } from '$lib/types/index.js';
import { SignJWT, jwtVerify } from 'jose';

/**
 * A helper class for generating and verifying JSON Web Tokens (JWT) using the HS256 algorithm.
 *
 * @remarks
 * This class provides static methods to create and validate JWTs with custom payloads and expiration times.
 *
 * @example
 * ```typescript
 * const token = await JWTHelper.generate('my-secret', { userId: 123 }, '1h');
 * const payload = await JWTHelper.verify(token, 'my-secret');
 * ```
 */
export class JWTHelper {
	/**
	 * Generates a signed JSON Web Token (JWT) using the provided secret and payload.
	 *
	 * @param secret - The secret key used to sign the JWT. Must not be empty.
	 * @param payload - The payload to include in the JWT. Should conform to `ExtendJWTPayload`.
	 * @param expired - Optional expiration time for the JWT (e.g., '1h', '2d', or a numeric value in seconds).
	 * @returns A promise that resolves to the signed JWT string.
	 * @throws If the secret is an empty string.
	 */
	public static async generate(secret: string, payload: ExtendJWTPayload, expired?: JWTExpiresIn) {
		if (secret === '') {
			throw new Error('Token must not be empty');
		}

		const jwt = new SignJWT(payload).setProtectedHeader({ alg: 'HS256' }).setIssuedAt();

		// Only set expiration if expiresIn is provided
		if (expired) {
			jwt.setExpirationTime(expired);
		}

		const encode = new TextEncoder().encode(secret);

		return jwt.sign(encode);
	}

	/**
	 * Verifies a JWT token using the provided secret and returns its payload.
	 *
	 * @param token - The JWT token string to verify.
	 * @param secret - The secret key used to verify the token.
	 * @returns A promise that resolves to the decoded payload of type `ExtendJWTPayload` if verification succeeds.
	 * @throws If the token is invalid or verification fails.
	 */
	public static async verify(token: string, secret: string) {
		const encode = new TextEncoder().encode(secret);
		const { payload } = await jwtVerify<ExtendJWTPayload>(token, encode);

		return payload;
	}
}
