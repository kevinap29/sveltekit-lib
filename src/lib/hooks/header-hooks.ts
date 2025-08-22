import { JWTHelper } from '$lib/helpers/jwt-helper.js';
import { redirect, type Handle } from '@sveltejs/kit';
import type { EndpointType } from '$lib/types/index.js';

/**
 * A class providing hooks for handling HTTP headers in SvelteKit endpoints,
 * specifically for managing authentication and authorization headers.
 *
 * @remarks
 * The `HeaderHooks` class is designed to be used in SvelteKit's hooks pipeline.
 * It generates and sets an `Authorization` header with a JWT token for authenticated users.
 * If token generation fails, it redirects the user to a fallback endpoint.
 *
 * @example
 * ```typescript
 * const hooks = new HeaderHooks('my-secret', '/login');
 * export const handle = hooks.handleIfAuthenticate;
 * ```
 *
 * @param secret - The secret key used for JWT token generation.
 * @param fallback - The endpoint to redirect to if authentication fails.
 *
 * @property secret - The JWT secret used for token generation.
 * @property fallback - The fallback endpoint for redirection on failure.
 *
 * @method handleIfAuthenticate
 * Handles the authentication logic, sets the `Authorization` header if the user is authenticated,
 * and redirects to the fallback endpoint if token generation fails.
 */
export class HeaderHooks {
	public secret: string;
	public fallback: EndpointType;

	constructor(secret: string, fallback: EndpointType) {
		this.secret = secret;
		this.fallback = fallback;
	}

	/**
	 * SvelteKit handle hook that checks if a user is authenticated.
	 *
	 * If `event.locals.user` exists, it attempts to generate a JWT token using the user's information
	 * and sets it in the `Authorization` header of the response. If token generation fails,
	 * the user is redirected to a fallback URL.
	 *
	 * @param event - The SvelteKit event object containing request and local data.
	 * @param resolve - The function to resolve the request and produce a response.
	 * @returns The resolved response, potentially with an `Authorization` header set.
	 * @throws Redirects to the fallback URL if JWT generation fails.
	 */
	public handleIfAuthenticate: Handle = async ({ event, resolve }) => {
		if (event.locals.user) {
			try {
				event.setHeaders({
					Authorization: `Bearer ${await JWTHelper.generate(this.secret, event.locals.user)}`
				});
			} catch {
				throw redirect(303, `${event.url.origin}${this.fallback}`);
			}
		}

		return await resolve(event);
	};
}
