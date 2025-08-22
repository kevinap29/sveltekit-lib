export * from './jwt-helper.js';
export * from './json-helper.js';

// Delay helper
/**
 * Pauses execution for a specified number of milliseconds.
 *
 * @param ms - The number of milliseconds to sleep.
 * @returns A promise that resolves after the specified delay.
 */
export function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
