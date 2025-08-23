import type { IMethodResponse } from '$lib/types/index.js';

const STRINGIFY_SUCCESS = `Success Stringify JSON`;
const STRINGIFY_FAILED = `Failed Stringify JSON`;
const PARSE_SUCCESS = `Success Parse JSON`;
const PARSE_FAILED = `Failed Parse JSON`;

function universalReviver(key: string, value: any): any {
	// ISO Date detection
	if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
		return new Date(value);
	}

	// BigInt detection
	if (typeof value === 'string' && /^\d{15,}$/.test(value)) {
		try {
			return BigInt(value);
		} catch {
			return value;
		}
	}

	// Objects with __type
	if (value && typeof value === 'object' && '__type' in value) {
		switch (value.__type) {
			case 'Set':
				return new Set(value.values);
			case 'Map':
				return new Map(value.entries);
			case 'RegExp':
				return new RegExp(value.source, value.flags);
			default:
				return value; // unknown __type → leave as is
		}
	}

	return value; // fallback: return as is
}

function universalReplacer(key: string, value: any): any {
	if (value instanceof Date) {
		return value.toISOString();
	}
	if (typeof value === 'bigint') {
		return value.toString();
	}
	if (value instanceof Set) {
		return { __type: 'Set', values: Array.from(value) };
	}
	if (value instanceof Map) {
		return { __type: 'Map', entries: Array.from(value.entries()) };
	}
	if (value instanceof RegExp) {
		return { __type: 'RegExp', source: value.source, flags: value.flags };
	}
	return value;
}

/**
 * A utility class for safe JSON serialization and deserialization.
 *
 * Provides static methods to safely stringify and parse JSON data using universal replacers and revivers.
 * Each method returns a standardized {@link IMethodResponse} indicating success or failure, along with
 * the resulting data or error information.
 *
 * @remarks
 * - Uses custom replacer and reviver functions for enhanced compatibility.
 * - Handles errors gracefully, returning informative messages.
 *
 * @example
 * ```typescript
 * const result = JSONHelper.safeStringify({ foo: "bar" });
 * if (result.success) {
 *   console.log(result.data); // Serialized JSON string
 * }
 * ```
 */
export class JSONHelper {
	/**
	 * Safely serializes a given input to a JSON string using a universal replacer.
	 * Returns a standardized response object indicating success or failure.
	 *
	 * @template T - The type of the input to be serialized.
	 * @param input - The value to serialize to JSON.
	 * @returns An {@link IMethodResponse} containing the JSON string on success,
	 * or an error message on failure.
	 */
	public static safeStringify<T>(input: T): IMethodResponse<string> {
		try {
			return {
				data: JSON.stringify(input, universalReplacer),
				success: true,
				message: STRINGIFY_SUCCESS
			};
		} catch (error: unknown) {
			const err = error as Error;

			return {
				cause: err.message,
				success: false,
				message: STRINGIFY_FAILED
			};
		}
	}

	/**
	 * Safely parses a JSON string and returns a typed result.
	 *
	 * Attempts to parse the provided JSON string using a universal reviver.
	 * If parsing succeeds, returns an object containing the parsed data, a success flag, and a success message.
	 * If parsing fails, returns an object containing the error message, a failure flag, and a failure message.
	 *
	 * @template T - The expected type of the parsed JSON data.
	 * @param input - The JSON string to parse.
	 * @returns An {@link IMethodResponse} containing either the parsed data or error information.
	 */
	public static safeParse<T>(input: string): IMethodResponse<T> {
		try {
			return {
				data: JSON.parse(input, universalReviver) as T,
				success: true,
				message: PARSE_SUCCESS
			};
		} catch (error: unknown) {
			const err = error as Error;

			return {
				cause: err.message,
				success: false,
				message: PARSE_FAILED
			};
		}
	}
}
