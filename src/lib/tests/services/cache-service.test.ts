// cache-service.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CacheService } from '$lib/services/cache-service.js';

describe('CacheService', () => {
	let cacheService: CacheService<object>;
	let stringCacheService: CacheService<string>;

	beforeEach(() => {
		cacheService = new CacheService<object>();
		stringCacheService = new CacheService<string>();
		vi.useFakeTimers();
	});

	it('should store and retrieve data', () => {
		const testData = { test: 'data' };
		cacheService.set('testKey', testData);
		const result = cacheService.get('testKey');

		expect(result?.data).toEqual(testData);
	});

	it('should store and retrieve string data', () => {
		const testString = 'test string';
		stringCacheService.set('testKey', testString);
		const result = stringCacheService.get('testKey');

		expect(result?.data).toEqual(testString);
	});

	it('should return null for non-existent keys', () => {
		expect(cacheService.get('nonExistentKey')).toBeNull();
	});

	it('should delete cached items', () => {
		cacheService.set('deleteKey', { test: 'delete' });
		cacheService.delete('deleteKey');

		expect(cacheService.get('deleteKey')).toBeNull();
	});

	it('should clear all cached items', () => {
		cacheService.set('key1', { test: 1 });
		cacheService.set('key2', { test: 2 });
		cacheService.clear();

		expect(cacheService.get('key1')).toBeNull();
		expect(cacheService.get('key2')).toBeNull();
	});

	it('should expire items after maxAge', () => {
		const maxAge = 5000; // 5 seconds
		const customCacheService = new CacheService<object>(maxAge);

		customCacheService.set('expireKey', { test: 'expire' });

		// Advance time by 6 seconds
		vi.advanceTimersByTime(6000);

		expect(customCacheService.get('expireKey')).toBeNull();
	});

	it('should store messages with data', () => {
		const testMessage = 'Test message';
		cacheService.set('messageKey', { test: 'message' }, testMessage);
		const result = cacheService.get('messageKey');

		expect(result?.message).toEqual(testMessage);
	});
});
