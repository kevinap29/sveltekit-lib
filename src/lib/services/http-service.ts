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
 * Rate limiting configuration - tracks timestamp of last request
 */
let lastRequestTime = 0;

/**
 * Checks if a given URL is allowed to be crawled according to the site's robots.txt rules.
 * 
 * This function fetches and parses the robots.txt file from the URL's origin to determine
 * if the specified path is allowed to be crawled by the given user agent.
 *
 * @param url - The URL to check against robots.txt rules
 * @param userAgent - User agent to check rules against (defaults to '*' which matches any agent)
 * @returns Promise resolving to boolean - true if crawling is allowed, false if disallowed
 * 
 * @example
 * ```
 * // Check if a URL is allowed to be crawled
 * const allowed = await isAllowedByRobots('https://example.com/path');
 * if (allowed) {
 *   // Proceed with crawling
 * }
 * ```
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
 * Finds links to Terms of Service or similar legal documents in HTML content.
 * 
 * This helper function scans the provided HTML for links containing common terms-related 
 * keywords and returns the absolute URL of the first matching link found.
 *
 * @param html - HTML content to scan for terms links
 * @param baseUrl - Base URL used to resolve relative links to absolute URLs
 * @returns Absolute URL to terms page if found, null otherwise
 * 
 * @internal Used by httpRequest to detect terms links in web pages
 */
function findTermsUrl(html: string, baseUrl: string): string | null {
	const $ = cheerio.load(html);
	const link = $('a[href*="terms"], a[href*="tos"], a[href*="conditions"]').attr('href');
	return link ? new URL(link, baseUrl).toString() : null;
}

/**
 * Sends an HTTP request with advanced features like caching, rate limiting, and compliance checks.
 *
 * This function wraps the standard fetch API with additional functionality to make web requests more
 * robust, ethical, and efficient. It supports both JSON and text/HTML responses with appropriate 
 * processing for each type.
 *
 * @template T Type of response data when requesting JSON content
 * @param request Configuration object containing:
 *  - `input`: URL or resource to request
 *  - `init`: Optional fetch configuration (headers, method, etc.)
 *  - `fetch`: Fetch implementation to use
 * @param option Request options:
 *  - `type`: Response format - 'text' for HTML/text or 'json' for JSON data
 *  - `checkRobots`: Whether to respect robots.txt rules (true/false)
 *  - `cache`: Cache duration in milliseconds (0 to disable caching)
 *  - `rateLimit`: Minimum milliseconds between requests (optional)
 * @returns Promise resolving to HttpResponse object with status, success flag, message, and response data
 * 
 * @example
 * ```
 * // Fetch HTML content with robots.txt check and 5-minute caching
 * const response = await httpRequest(
 *   { 
 *     input: 'https://example.com',
 *     fetch: fetch 
 *   },
 *   { 
 *     type: 'text',
 *     checkRobots: true,
 *     cache: 1000 * 60, // 1 minute cache
 *     rateLimit: 1000 // 1 second between requests
 *   }
 * );
 * 
 * if (response.success) {
 *   const html = response.value as string;
 *   // Process HTML content
 * }
 * ```
 */
export async function httpRequest<T>(
	request: HttpRequestType,
	option: {
		type: 'text' | 'json';
		checkRobots: boolean;
		cache?: number;
		rateLimit?: number
	}
): Promise<HttpResponse<T | string>> {
	let result: HttpResponse<T | string> = {
		status: 500,
		success: false,
		message: '',
		value: ''
	};

	try {
		// 1. Check cache
		cacheService.init(option.cache)

		const cached = cacheService.get(`url-${request.input.toString()}`);
		if (cached && (Date.now() - cached.timestamp < (option.cache ?? 0))) {
			result.status = 200;
			result.success = true;
			result.message = 'OK';
			result.value = typeof cached.data === 'string' ? cached.data : (cached.data as T);

			return result;
		}

		// 2. Apply rate limiting
		const now = Date.now();
		const timeSinceLast = now - lastRequestTime;
		if (option.rateLimit && timeSinceLast < option.rateLimit) {
			await sleep(option.rateLimit - timeSinceLast);
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
			`url-${request.input.toString()}`,
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
