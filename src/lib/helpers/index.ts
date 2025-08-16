export * from './jwt-helper.js';

// Delay helper
export function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}