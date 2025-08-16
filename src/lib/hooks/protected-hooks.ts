import { type Handle, redirect } from '@sveltejs/kit';
import { JWTHelper } from '$lib/helpers/index.js';
import { DEV } from 'esm-env';
import type { AuthenticationHeader, ProtectedAndFallbackEndpoint } from '$lib/types/index.js';

/**
 * Provides middleware for protecting SvelteKit endpoints using JWT authentication.
 * 
 * The `ProtectedHooks` class allows you to specify protected endpoints and their fallback routes.
 * When a request is made to a protected endpoint in production mode, the class checks for a valid
 * Bearer token in the `Authorization` header. If authentication fails, the user is redirected to
 * the specified fallback route.
 * 
 * @remarks
 * - Endpoints must start with a `/`.
 * - In production, requests to protected endpoints require a valid JWT token.
 * - On successful authentication, user information is attached to `event.locals.user`.
 * 
 * @example
 * ```typescript
 * // ./src/app.d.ts
 * declare global {
 *	    namespace App {
            interface Locals {
                user?: ExtendJWTPayload;
            }
 *	    }
 *}
 * 
 * // ./src/lib/your-hooks/
 * const protectedHooks = new ProtectedHooks('my-secret', [
 *   { protected: '/admin', fallback: '/login' }
 * ]);
 * export const handle = hooks.handle;
 * ```
 * 
 * @param secret - The JWT secret used for token verification.
 * @param endpoints - An array of objects specifying protected and fallback endpoint paths.
 */
export class ProtectedHooks {
	public secret: string;
	public endpoints: ProtectedAndFallbackEndpoint[];
	public isProduction: boolean

	constructor(secret: string, endpoints: ProtectedAndFallbackEndpoint[], isProduction: boolean) {
		this.secret = secret;
		this.endpoints = endpoints;
		this.isProduction = isProduction;
	}

    /**
     * SvelteKit handle hook for protecting endpoints based on authentication.
     *
     * This hook checks if the current request targets a protected endpoint and, if in production,
     * verifies the presence and validity of a Bearer token in the Authorization header.
     * If authentication fails, the user is redirected to the specified fallback endpoint.
     * On successful verification, the decoded JWT payload is assigned to `event.locals.user`.
     *
     * @param event - The request event containing URL, headers, and locals.
     * @param resolve - The function to resolve the request and generate a response.
     * @returns A promise resolving to the response after authentication checks.
     *
     * @throws Error if endpoint formats are invalid.
     * @throws Redirect if authentication fails for protected endpoints.
     */
	public handle: Handle = async ({ event, resolve }) => {
		const isProduction = !event.locals.user && !DEV;

		for (const endpoint of this.endpoints) {
			try {
				if (!endpoint.fallback.startsWith('/') || !endpoint.protected.startsWith('/')) {
					throw redirect(
						303,
						`${event.url.origin}${endpoint.fallback}`
					);
				}
	
				if (event.url.pathname.startsWith(endpoint.protected) && this.isProduction && !event.locals.user) {
					const auth_header = event.request.headers.get(
						'Authorization'
					) as AuthenticationHeader | null;
	
					if (!auth_header)
						throw redirect(
							303,
							`${event.url.origin}${endpoint.fallback}`
						);
	
					if (!auth_header.startsWith('Bearer '))
						throw redirect(
							303,
							`${event.url.origin}${endpoint.fallback}`
						);
	
					const token = auth_header.split(' ').at(1);
	
					if (!token) {
						throw redirect(
							303,
							`${event.url.origin}${endpoint.fallback}`
						);
					}
	
					const verify = await JWTHelper.verify(token, this.secret);
					
					if (!verify.email)
						throw redirect(
							303,
							`${event.url.origin}${endpoint.fallback}`
						);
	
					event.locals.user = { ...verify };
				}
			} catch {
				throw redirect(
					303,
					`${event.url.origin}${endpoint.fallback}`
				);
			}
		}

		return await resolve(event);
	};
}
