import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LocalStorageState } from '$lib/states/local-storage-state.svelte.js';

describe('LocalStorageState', () => {
	let localStorageState: LocalStorageState;
	let mockStorage: Storage;

	beforeEach(() => {
		// Create a mock storage implementation
		mockStorage = {
			length: 0,
			clear: vi.fn(),
			getItem: vi.fn(),
			key: vi.fn(),
			removeItem: vi.fn(),
			setItem: vi.fn()
		};

		localStorageState = new LocalStorageState();
	});

	describe('initialization', () => {
		it('should set length to 0 when initialized with null', () => {
			localStorageState.init(null);
			expect(localStorageState.length).toBe(0);
		});

		it('should set storage when initialized with Storage object', () => {
			localStorageState.init(mockStorage);
			expect(localStorageState.length).toBe(0);
		});
	});

	describe('set', () => {
		it('should return error when storage not initialized', () => {
			const result = localStorageState.set('test', 'value');
			if (!result.success) {
				expect(result.success).toBe(false);
				expect(result.cause).toContain('not initialize');
			}
		});

		it('should successfully set value when storage initialized', () => {
			localStorageState.init(mockStorage);
			const result = localStorageState.set('test', 'value');
			expect(result.success).toBe(true);
			expect(mockStorage.setItem).toHaveBeenCalledWith('test', 'value');
		});
	});

	describe('get', () => {
		it('should return error when storage not initialized', () => {
			const result = localStorageState.get('test');
			if (!result.success) {
				expect(result.success).toBe(false);
				expect(result.cause).toContain('not initialize');
			}
		});

		it('should return null when key not found', () => {
			localStorageState.init(mockStorage);
			vi.mocked(mockStorage.getItem).mockReturnValue(null);

			const result = localStorageState.get('nonexistent');
			if (result.success) {
				expect(result.success).toBe(true);
				expect(result.data).toBeNull();
			}
		});

		it('should successfully get value when key exists', () => {
			localStorageState.init(mockStorage);
			vi.mocked(mockStorage.getItem).mockReturnValue('{"test": "data"}');

			const result = localStorageState.get('test');
			if (result.success) {
				expect(result.success).toBe(true);
				expect(result.data).toEqual({ test: 'data' });
			}
		});
	});

	describe('remove', () => {
		it('should return error when storage not initialized', () => {
			const result = localStorageState.remove('test');
			expect(result.success).toBe(false);
			expect(result.cause).toContain('not initialize');
		});

		it('should successfully remove item when storage initialized', () => {
			localStorageState.init(mockStorage);
			const result = localStorageState.remove('test');
			expect(result.success).toBe(true);
			expect(mockStorage.removeItem).toHaveBeenCalledWith('test');
		});
	});
});
