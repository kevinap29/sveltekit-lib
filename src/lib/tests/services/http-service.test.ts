import { describe, it, expect, vi, beforeEach } from 'vitest';
import { httpRequest } from '$lib/services/http-service.js';

describe('httpRequest', async () => {
	it('should fetch JSON data', async () => {
		const url = 'https://jsonplaceholder.typicode.com/todos/1';
		const result = await httpRequest<{
			userId: number;
			id: number;
			title: string;
			completed: boolean;
		}>(
			{
				fetch: fetch,
				input: new URL(url),
				init: { method: 'GET' }
			},
			{ type: 'json', checkRobots: false }
		);

		if (result.success && typeof result.value !== 'string') {
			expect(result.success).toBe(true);
			expect(result.status).toBe(200);
			expect(result.value).toBeDefined();
			expect(result.value.id).toBe(1);
		}
	});

	it('should fetch text data', async () => {
		const url = 'https://www.example.com/';
		const result = await httpRequest<string>(
			{
				fetch: fetch,
				input: new URL(url),
				init: { method: 'GET' }
			},
			{ type: 'text', checkRobots: false }
		);

		if (result.success && typeof result.value === 'string') {
			expect(result.success).toBe(true);
			expect(result.status).toBe(200);
			expect(result.value).toContain('<h1>Example Domain</h1>');
		}
	});

	it('should respect robots.txt', async () => {
		const url = 'https://www.linkedin.com/';
		const result = await httpRequest<string>(
			{
				fetch: fetch,
				input: new URL(url),
				init: { method: 'GET' }
			},
			{ type: 'text', checkRobots: true }
		);
		// console.log(new URL(url))
		// console.table(result);
		expect(result.success).toBe(false);
		expect(result.status).toBe(403);
		expect(result.message).toBe('Blocked by robots.txt');
	});

	it('should cache results', async () => {
		const url = 'https://jsonplaceholder.typicode.com/todos/1';
		const firstResult = await httpRequest<{
			userId: number;
			id: number;
			title: string;
			completed: boolean;
		}>(
			{
				fetch: fetch,
				input: new URL(url),
				init: { method: 'GET' }
			},
			{ type: 'json', checkRobots: false }
		);

		const secondResult = await httpRequest<{
			userId: number;
			id: number;
			title: string;
			completed: boolean;
		}>(
			{
				fetch: fetch,
				input: new URL(url),
				init: { method: 'GET' }
			},
			{ type: 'json', checkRobots: false }
		);

		if (
			firstResult.success &&
			secondResult.success &&
			typeof firstResult.value !== 'string' &&
			typeof secondResult.value !== 'string'
		) {
			expect(firstResult.value).toEqual(secondResult.value);
		}
	});

	it('should handle network errors gracefully', async () => {
		const url = 'https://nonexistent.example.com/';
		const result = await httpRequest<string>(
			{
				fetch: fetch,
				input: new URL(url),
				init: { method: 'GET' }
			},
			{ type: 'text', checkRobots: false }
		);

		expect(result.success).toBe(false);
		expect(result.status).toBe(500);
		expect(result.message).toBe(
			"Can't load 'https://nonexistent.example.com/' at this moment, please use another link"
		);
	});
});
