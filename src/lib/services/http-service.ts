import * as cheerio from 'cheerio';
import { sleep } from '$lib/helpers/index.js';
import { JSONHelper } from '$lib/helpers/index.js';
import { CacheService } from '$lib/services/cache-service.js';
import type { HttpRequestType, HttpResponse } from '$lib/types/index.js';

/**
 * Simple in-memory cache for HTTP responses
 * Replaces previous Map implementation with CacheService
 */
const cacheService = new CacheService<string | object>();

/**
 * Rate limiting configuration
 */
let lastRequestTime = 0;
const MIN_INTERVAL = 123; // ms between requests

/**
 * Checks if a given URL is allowed to be crawled according to the site's robots.txt rules for a specified user agent.
 *
 * Fetches the robots.txt file from the origin of the provided URL and parses its rules.
 * If robots.txt is not found or cannot be fetched, the function assumes crawling is allowed.
 * Only basic parsing is performed: it checks for matching `User-agent` and `Disallow` directives.
 *
 * @param url - The URL to check against the site's robots.txt rules.
 * @param userAgent - The user agent string to match in robots.txt. Defaults to '*'.
 * @returns A promise that resolves to `true` if crawling is allowed, or `false` if disallowed.
 */
export async function isAllowedByRobots(url: string, userAgent = '*'): Promise<boolean> {
	try {
		const { origin, pathname } = new URL(url);
		const robotsUrl = `${origin}/robots.txt`;
		const res = await fetch(robotsUrl);
		if (!res.ok) return true; // If robots.txt not found, assume allowed

		const text = await res.text();
		const lines = text.split('\n');
		let applies = false;

		for (let line of lines) {
			line = line.trim();
			if (line.toLowerCase().startsWith('user-agent')) {
				applies = line.split(':')[1].trim() === '*' || line.includes(userAgent);
			}
			if (applies && line.toLowerCase().startsWith('disallow')) {
				const disallowedPath = line.split(':')[1].trim();
				if (pathname.startsWith(disallowedPath)) {
					return false;
				}
			}
		}
		return true;
	} catch {
		return true; // Fail open - if there's an error checking robots.txt, allow the request
	}
}

/**
 * Searches the provided HTML for a hyperlink containing keywords related to terms and conditions,
 * such as "terms", "tos", or "conditions", and returns the absolute URL of the first match.
 *
 * @param html - The HTML content to search for terms-related links.
 * @param baseUrl - The base URL to resolve relative links against.
 * @returns The absolute URL of the found terms link, or `null` if no such link is found.
 */
function findTermsUrl(html: string, baseUrl: string): string | null {
	const $ = cheerio.load(html);
	const link = $('a[href*="terms"], a[href*="tos"], a[href*="conditions"]').attr('href');
	return link ? new URL(link, baseUrl).toString() : null;
}

/**
 * Sends an HTTP request with caching, rate limiting, and optional robots.txt and Terms of Service checks.
 *
 * @template T The expected type of the response value when `option.type` is `'json'`.
 * @param request The HTTP request configuration object containing:
 *  - `input`: The URL or resource to request
 *  - `init`: Optional fetch configuration options
 *  - `fetch`: The fetch implementation to use
 * @param option Configuration options:
 *  - `type`: Specifies the response format, either `'text'` (HTML/text) or `'json'`.
 *  - `checkRobots`: If `true`, checks robots.txt before making the request.
 * @returns A promise that resolves to an `HttpResponse` containing:
 *  - `status`: HTTP status code
 *  - `success`: Boolean indicating if the request succeeded
 *  - `message`: Response message or error information
 *  - `value`: Response data (type depends on the `option.type` setting)
 *
 * @remarks
 * - Caches responses for 10 minutes to reduce redundant requests.
 * - Enforces a minimum interval between requests for rate limiting.
 * - If `checkRobots` is enabled, blocks requests disallowed by robots.txt.
 * - For HTML/text requests, warns if a Terms of Service link is detected in the response.
 * - Handles errors gracefully and returns a standardized error response.
 */
export async function httpRequest<T>(
	request: HttpRequestType,
	option: {
		type: 'text' | 'json';
		checkRobots: boolean;
	}
): Promise<HttpResponse<T | string>> {
	let result: HttpResponse<T | string> = {
		status: 500,
		success: false,
		message: '',
		value: ''
	};

	try {
		// 1. Check cache (10 minutes expiration)
		const cached = cacheService.get(request.input.toString());
		if (cached && Date.now() - cached.timestamp < 10 * 60 * 1000) {
			result.status = 200;
			result.success = true;
			result.message = 'OK';
			result.value = typeof cached.data === 'string' ? cached.data : (cached.data as T);

			return result;
		}

		// 2. Apply rate limiting
		const now = Date.now();
		const timeSinceLast = now - lastRequestTime;
		if (timeSinceLast < MIN_INTERVAL) {
			await sleep(MIN_INTERVAL - timeSinceLast);
		}
		lastRequestTime = Date.now();

		// 3. Check robots.txt if enabled
		if (option.checkRobots) {
			const allowed = await isAllowedByRobots(request.input.toString());
			if (!allowed) {
				result.status = 403;
				result.success = false;
				result.message = 'Blocked by robots.txt';

				return result;
			}
		}

		// 4. Process request based on type
		if (option.type === 'text') {
			const response = await request.fetch(request.input, request.init);
			const html = await response.text();

			// Find possible Terms of Service URL
			const termsUrl = findTermsUrl(html, request.input.toString());
			if (termsUrl) {
				console.warn(`⚠ Check Terms of Service before scraping: ${termsUrl}`);
			}

			result.status = 200;
			result.success = true;
			result.message = termsUrl ? `⚠ Check Terms of Service before scraping: ${termsUrl}` : 'OK';
			result.value = html;
		} else {
			// JSON mode
			const response = await request.fetch(request.input, request.init);
			const parse = JSONHelper.safeParse<T>(await response.json());

			if (!parse.success) {
				result.status = 500;
				result.success = false;
				result.message = parse.message;

				return result;
			}

			result.status = 200;
			result.success = true;
			result.message = 'OK';
			result.value = parse.data;
		}

		// 5. Store successful response in cache
		cacheService.set(
			request.input.toString(),
			typeof result.value === 'string' ? result.value : (result.value as object),
			result.message
		);
	} catch (e: unknown) {
		const error = e as Error;
		console.error(error);
		result.status = 500;
		result.success = false;
		result.message = `Can't load '${request.input.toString()}' at this moment, please use another link`;
	} finally {
		return result;
	}
}
