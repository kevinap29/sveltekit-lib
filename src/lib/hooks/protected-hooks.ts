import { type Handle, redirect } from '@sveltejs/kit';
import { JWTHelper } from '$lib/helpers/index.js';
import { DEV } from 'esm-env';
import type { AuthenticationHeader, ProtectedAndFallbackEndpoint } from '$lib/types/index.js';

/**
 * A class that provides middleware for protecting SvelteKit endpoints using JWT authentication.
 *
 * @remarks
 * This class is designed to be used in SvelteKit hooks to restrict access to specified endpoints.
 * If a request targets a protected endpoint and the user is not authenticated, it redirects to a fallback endpoint.
 * Authentication is performed using a JWT token provided in the `Authorization` header.
 *
 * @example
 * ```typescript
 * const protectedHooks = new ProtectedHooks('my-secret', [
 *   { protected: '/api/private', fallback: '/login' }
 * ]);
 * export const handle = protectedHooks.handle;
 * ```
 *
 * @param secret - The secret key used to verify JWT tokens.
 * @param endpoints - An array of endpoint configurations specifying protected and fallback routes.
 *
 * @property secret - The JWT secret key.
 * @property endpoints - The list of protected and fallback endpoint pairs.
 * @method handle - The SvelteKit handle function to be used in hooks.
 */
export class ProtectedHooks {
	public secret: string;
	public endpoints: ProtectedAndFallbackEndpoint[];

	constructor(secret: string, endpoints: ProtectedAndFallbackEndpoint[]) {
		this.secret = secret;
		this.endpoints = endpoints;
	}

	/**
	 * SvelteKit handle hook that protects specified endpoints by requiring authentication.
	 *
	 * For each configured endpoint, this hook checks if the request path matches a protected route.
	 * If the application is in production and the user is not authenticated, it attempts to validate
	 * the request's `Authorization` header as a Bearer token using the provided JWT secret.
	 *
	 * If authentication fails or the header is missing/invalid, the user is redirected to the endpoint's fallback URL.
	 *
	 * @param event - The SvelteKit event object containing request and locals.
	 * @param resolve - The SvelteKit resolve function to continue processing the request.
	 * @returns The resolved response if authentication passes, otherwise redirects to fallback.
	 */
	public handle: Handle = async ({ event, resolve }) => {
		const isProduction = !event.locals.user && !DEV;

		for (const endpoint of this.endpoints) {
			try {
				if (!endpoint.fallback.startsWith('/') || !endpoint.protected.startsWith('/')) {
					throw redirect(303, `${event.url.origin}${endpoint.fallback}`);
				}

				if (
					event.url.pathname.startsWith(endpoint.protected) &&
					isProduction &&
					!event.locals.user
				) {
					const auth_header = event.request.headers.get(
						'Authorization'
					) as AuthenticationHeader | null;

					if (!auth_header) throw redirect(303, `${event.url.origin}${endpoint.fallback}`);

					if (!auth_header.startsWith('Bearer '))
						throw redirect(303, `${event.url.origin}${endpoint.fallback}`);

					const token = auth_header.split(' ').at(1);

					if (!token) {
						throw redirect(303, `${event.url.origin}${endpoint.fallback}`);
					}

					const verify = await JWTHelper.verify(token, this.secret);

					if (!verify.email) throw redirect(303, `${event.url.origin}${endpoint.fallback}`);

					event.locals.user = { ...verify };
				}
			} catch {
				throw redirect(303, `${event.url.origin}${endpoint.fallback}`);
			}
		}

		return await resolve(event);
	};
}
