import * as cheerio from 'cheerio';
import type { HttpRequestType, HttpResponse } from '$lib/types/index.js';

// Simple in-memory cache
const cache = new Map<string, { 
	data: string | object
	message: string
	timestamp: number 
}>();

// Rate limiting state
let lastRequestTime = 0;
const MIN_INTERVAL = 123; // ms between requests

// Delay helper
function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

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
		return true; // Fail open
	}
}

function findTermsUrl(html: string, baseUrl: string): string | null {
	const $ = cheerio.load(html);
	const link = $('a[href*="terms"], a[href*="tos"], a[href*="conditions"]').attr('href');
	return link ? new URL(link, baseUrl).toString() : null;
}

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
		// 1. Caching (10 minutes)
		const cached = cache.get(request.input.toString());
		if (cached && Date.now() - cached.timestamp < 10 * 60 * 1000) {
			result.status = 200;
			result.success = true;
			result.message = 'OK';
			result.value = typeof cached.data === 'string' ? cached.data : (cached.data as T);

			return result;
		}

		// 2. Rate limiting
		const now = Date.now();
		const timeSinceLast = now - lastRequestTime;
		if (timeSinceLast < MIN_INTERVAL) {
			await sleep(MIN_INTERVAL - timeSinceLast);
		}
		lastRequestTime = Date.now();

		if (option.checkRobots) {
			const allowed = await isAllowedByRobots(request.input.toString());
			if (!allowed) {
				result.status = 403;
				result.success = false;
				result.message = 'Blocked by robots.txt';

				return result;
			}
		}

		// 2️⃣ If HTML request, also check for Terms of Service link
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

			cache.set(request.input.toString(), { 
				data: html, 
				message: result.message,
				timestamp: Date.now() 
			})
		} else {
			// JSON mode
			const response = await request.fetch(request.input, request.init);
			const data = await response.json();
			
			
			result.status = 200;
			result.success = true;
			result.message = 'OK';
			result.value = data as T;

			cache.set(request.input.toString(), { 
				data: data,
				message: result.message, 
				timestamp: Date.now() 
			})
		}
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
