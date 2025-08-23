import { JSONHelper } from '$lib/helpers/json-helper.js';
import type { IMethodResponse } from '$lib/types/index.js';

const SET_LOCAL_STORAGE_SUCCESS = `Local Storage Set Successfully`;
const SET_LOCAL_STORAGE_FAILED = `Failed set data local storage`;
const GET_LOCAL_STORAGE_SUCCESS = `Local Storage Get Successfully`;
const GET_LOCAL_STORAGE_FAILED = `Failed Get data local storage`;
const REMOVE_LOCAL_STORAGE_SUCCESS = `Local Storage Remove Successfully`;
const REMOVE_LOCAL_STORAGE_FAILED = `Failed Remove data local storage`;

/**
 * Manages localStorage operations in a browser environment.
 *
 * This class provides methods to set, get, and remove items from localStorage,
 * with type-safe parsing and error handling. It checks for browser context before
 * performing any localStorage operations.
 *
 * @example
 * ```typescript
 * const state = new LocalStorageState(true);
 * state.setLocalStorage('key', JSON.stringify({ foo: 'bar' }));
 * const result = state.getLocalStorage<{ foo: string }>('key');
 * ```
 *
 * @remarks
 * - All methods return an `IMethodResponse` object indicating success, message, and optional data.
 * - The class should be instantiated with a boolean indicating browser context.
 *
 * @property {boolean} isBrowser - Indicates if running in a browser environment.
 * @property {number} length - The number of items in localStorage.
 *
 * @method setLocalStorage - Stores a string value under a given key in localStorage.
 * @method getLocalStorage - Retrieves and parses a value from localStorage by key.
 * @method removeLocalStorage - Removes an item from localStorage by key.
 */
export class LocalStorageState {
	private isBrowser: boolean = $state(false);
	public length: number = $state(0);

	constructor(browser: boolean) {
		this.isBrowser = browser;

		if (this.isBrowser) {
			this.length = localStorage.length;
		}
	}

	/**
	 * Sets a value in the browser's local storage under the specified key.
	 *
	 * @param key - The key under which the value will be stored.
	 * @param value - The string value to store.
	 * @returns An object indicating the success or failure of the operation.
	 *          If not running in a browser environment, returns a failure response.
	 */
	public setLocalStorage(key: string, value: string): IMethodResponse<null> {
		if (!this.isBrowser) {
			return {
				cause: `State only on browser`,
				success: false,
				message: SET_LOCAL_STORAGE_FAILED
			};
		}

		localStorage.setItem(key, value);

		return {
			success: true,
			message: SET_LOCAL_STORAGE_SUCCESS,
			data: null
		};
	}

	/**
	 * Retrieves and parses a value from localStorage by the specified key.
	 *
	 * @template T The expected type of the parsed value.
	 * @param {string} key - The key to look up in localStorage.
	 * @returns {IMethodResponse<T>} An object containing the result of the operation:
	 * - If the key does not exist, returns a failure response with a cause and message.
	 * - If parsing fails, returns a failure response with the parsing error message.
	 * - If successful, returns a success response with the parsed data.
	 */
	public getLocalStorage<T>(key: string): IMethodResponse<T> {
		try {
			const value = localStorage.getItem(key);

			if (!value) {
				return {
					cause: `There is no data on ${key}`,
					success: false,
					message: GET_LOCAL_STORAGE_FAILED
				};
			}

			const parseJson = JSONHelper.safeParse<T>(value);

			if (!parseJson.success) {
				return {
					cause: parseJson.message,
					success: false,
					message: GET_LOCAL_STORAGE_FAILED
				};
			}

			return {
				data: parseJson.data,
				success: true,
				message: GET_LOCAL_STORAGE_SUCCESS
			};
		} catch (error: unknown) {
			const err = error as Error;

			return {
				cause: err.message,
				success: false,
				message: GET_LOCAL_STORAGE_FAILED
			};
		}
	}

	/**
	 * Removes an item from the browser's local storage by the specified key.
	 *
	 * @param key - The key of the item to remove from local storage.
	 * @returns An object indicating the success or failure of the operation.
	 *          If not running in a browser environment, returns a failure object with a cause.
	 *          On success, returns a success object with a message and null data.
	 */
	public removeLocalStorage(key: string) {
		if (!this.isBrowser) {
			return {
				cause: `State only on browser`,
				success: false,
				message: REMOVE_LOCAL_STORAGE_FAILED
			};
		}

		localStorage.removeItem(key);

		return {
			success: true,
			message: REMOVE_LOCAL_STORAGE_SUCCESS,
			data: null
		};
	}
}
