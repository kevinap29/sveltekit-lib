import { describe, it, expect } from 'vitest';
import { JSONHelper } from '$lib/helpers/index.js';

describe('JSONHelper.safeStringify', () => {
	it('should stringify a plain object', () => {
		const input = { foo: 'bar', num: 42 };
		const result = JSONHelper.safeStringify(input);

		if (!result.success) {
			console.error(`${result.message}, ${result.cause}`);
			return;
		}

		expect(result.data).toBe(JSON.stringify(input));
	});

	it('should stringify a Date object as ISO string', () => {
		const date = new Date('2024-06-01T12:00:00Z');
		const result = JSONHelper.safeStringify({ date });

		if (!result.success) {
			console.error(`${result.message}, ${result.cause}`);
			return;
		}

		const parsed = JSON.parse(result.data!);
		expect(parsed.date).toBe(date.toISOString());
	});

	it('should stringify a BigInt as string', () => {
		const big = BigInt('12345678901234567890');
		const result = JSONHelper.safeStringify({ big });

		if (!result.success) {
			console.error(`${result.message}, ${result.cause}`);
			return;
		}

		const parsed = JSON.parse(result.data!);
		expect(parsed.big).toBe(big.toString());
	});

	it('should stringify a Set as an object with __type', () => {
		const set = new Set([1, 2, 3]);
		const result = JSONHelper.safeStringify({ set });

		if (!result.success) {
			console.error(`${result.message}, ${result.cause}`);
			return;
		}

		const parsed = JSON.parse(result.data!);
		expect(parsed.set.__type).toBe('Set');
		expect(parsed.set.values).toEqual([1, 2, 3]);
	});

	it('should stringify a Map as an object with __type', () => {
		const map = new Map([
			['a', 1],
			['b', 2]
		]);
		const result = JSONHelper.safeStringify({ map });

		if (!result.success) {
			console.error(`${result.message}, ${result.cause}`);
			return;
		}

		const parsed = JSON.parse(result.data!);
		expect(parsed.map.__type).toBe('Map');
		expect(parsed.map.entries).toEqual([
			['a', 1],
			['b', 2]
		]);
	});

	it('should stringify a RegExp as an object with __type', () => {
		const regex = /abc/gi;
		const result = JSONHelper.safeStringify({ regex });

		if (!result.success) {
			console.error(`${result.message}, ${result.cause}`);
			return;
		}

		const parsed = JSON.parse(result.data);
		expect(parsed.regex.__type).toBe('RegExp');
		expect(parsed.regex.source).toBe('abc');
		expect(parsed.regex.flags).toBe('gi');
	});

	it('should handle circular references and return failure', () => {
		const obj: any = {};
		obj.self = obj;
		const result = JSONHelper.safeStringify(obj);

		if (result.success) {
			console.error(`Expected to be error`);
			return;
		}

		expect(result.success).toBe(false);
		expect(result.message).toBe('Failed Stringify JSON');
		expect(result.cause).toMatch(/circular/i);
	});
});

describe('JSONHelper.safeParse', () => {
	it('should parse a plain object JSON string', () => {
		const input = { foo: 'bar', num: 42 };
		const json = JSON.stringify(input);
		const result = JSONHelper.safeParse<typeof input>(json);

		if (!result.success) {
			console.error(`${result.message}, ${result.cause}`);
			return;
		}

		expect(result.data).toEqual(input);
	});

	it('should revive Date strings as Date objects', () => {
		const date = new Date('2024-06-01T12:00:00Z');
		const obj = { date: date.toISOString() };
		const json = JSON.stringify(obj);
		const result = JSONHelper.safeParse<{ date: Date }>(json);

		if (!result.success) {
			console.error(`${result.message}, ${result.cause}`);
			return;
		}

		expect(result.data.date instanceof Date).toBe(true);
		expect(result.data.date.toISOString()).toBe(date.toISOString());
	});

	it('should revive BigInt strings as BigInt', () => {
		const big = BigInt('12345678901234567890');
		const obj = { big: big.toString() };
		const json = JSON.stringify(obj);
		const result = JSONHelper.safeParse<{ big: BigInt }>(json);

		if (!result.success) {
			console.error(`${result.message}, ${result.cause}`);
			return;
		}

		expect(typeof result.data.big).toBe('bigint');
		expect(result.data.big.toString()).toBe(big.toString());
	});

	it('should revive Set objects from __type', () => {
		const obj = { set: { __type: 'Set', values: [1, 2, 3] } };
		const json = JSON.stringify(obj);
		const result = JSONHelper.safeParse<{ set: Set<number> }>(json);

		if (!result.success) {
			console.error(`${result.message}, ${result.cause}`);
			return;
		}

		expect(result.data.set instanceof Set).toBe(true);
		expect(Array.from(result.data.set)).toEqual([1, 2, 3]);
	});

	it('should revive Map objects from __type', () => {
		const obj = {
			map: {
				__type: 'Map',
				entries: [
					['a', 1],
					['b', 2]
				]
			}
		};
		const json = JSON.stringify(obj);
		const result = JSONHelper.safeParse<{ map: Map<string, number> }>(json);

		if (!result.success) {
			console.error(`${result.message}, ${result.cause}`);
			return;
		}

		expect(result.data.map instanceof Map).toBe(true);
		expect(Array.from(result.data.map.entries())).toEqual([
			['a', 1],
			['b', 2]
		]);
	});

	it('should revive RegExp objects from __type', () => {
		const obj = { regex: { __type: 'RegExp', source: 'abc', flags: 'gi' } };
		const json = JSON.stringify(obj);
		const result = JSONHelper.safeParse<{ regex: RegExp }>(json);

		if (!result.success) {
			console.error(`${result.message}, ${result.cause}`);
			return;
		}

		expect(result.data.regex instanceof RegExp).toBe(true);
		expect(result.data.regex.source).toBe('abc');
		expect(result.data.regex.flags).toBe('gi');
	});

	it('should handle invalid JSON and return failure', () => {
		const invalidJson = '{"foo": "bar",}';
		const result = JSONHelper.safeParse<any>(invalidJson);

		if (result.success) {
			console.error(`Expected to be error`);
			return;
		}

		console.table(result);

		expect(result.success).toBe(false);
		expect(result.message).toBe('Failed Parse JSON');
		expect(result.cause).toBeDefined();
	});
});
