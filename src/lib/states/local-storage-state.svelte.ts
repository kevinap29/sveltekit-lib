import { JSONHelper } from '$lib/helpers/json-helper.js';
import type { IMethodResponse } from '$lib/types/index.js';

const SET_LOCAL_STORAGE_SUCCESS = `Local Storage Set Successfully`;
const SET_LOCAL_STORAGE_FAILED = `Failed Set data local storage`;
const GET_LOCAL_STORAGE_SUCCESS = `Local Storage Get Successfully`;
const GET_LOCAL_STORAGE_FAILED = `Failed Get data local storage`;
const REMOVE_LOCAL_STORAGE_SUCCESS = `Local Storage Remove Successfully`;
const REMOVE_LOCAL_STORAGE_FAILED = `Failed Remove data local storage`;

/**
 * Manages state using the browser's `localStorage` or `sessionStorage`.
 * 
 * Provides methods to initialize the storage, set, get, and remove items,
 * with type-safe responses and error handling.
 * 
 * Usage:
 * Use `setLocalStorage`, `getLocalStorage`, and `removeLocalStorage` to interact with storage.
 * 
 * @remarks
 * - All operations return an `IMethodResponse` indicating success, message, and optional data or cause.
 * - Uses `JSONHelper.safeParse` for safe JSON parsing when retrieving values.
 * - The `length` property reflects the number of items in the storage.
 */
export class LocalStorageState {
	private ls: Storage | null = null; 
	public length: number = $state(0);

	/**
	 * Initializes the local storage state by assigning the provided `Storage` instance.
	 * Also sets the `length` property to the number of items in the storage.
	 *
	 * @param ls - The `Storage` instance (e.g., `localStorage` or `sessionStorage`) to use for state management.
	 */
	public init(ls: Storage | null) {
		if (!ls) {
			return;
		}

		this.ls = ls;
		this.length = this.ls.length;
	}

	/**
	 * Sets a value in local storage for the specified key.
	 *
	 * @param key - The key under which the value will be stored.
	 * @param value - The value to store in local storage.
	 * @returns An object indicating the success or failure of the operation.
	 *          If local storage is not initialized, returns a failure response with a cause.
	 *          On success, returns a success response with a message and null data.
	 */
	public set(key: string, value: string): IMethodResponse<null> {
		if (!this.ls) {
			return {
				cause: `Local Storage is not initialize, run this.init(localStorage) before`,
				success: false,
				message: SET_LOCAL_STORAGE_FAILED
			}
		}
		
		this.ls?.setItem(key, value);

		return {
			success: true,
			message: SET_LOCAL_STORAGE_SUCCESS,
			data: null
		};
	}

	/**
	 * Retrieves and parses a value from localStorage by the specified key.
	 *
	 * @template T - The expected type of the parsed value.
	 * @param {string} key - The key to look up in localStorage.
	 * @returns {IMethodResponse<T>} An object containing the result of the operation:
	 * - If successful, `data` holds the parsed value, `success` is true, and `message` indicates success.
	 * - If unsuccessful, `cause` describes the error, `success` is false, and `message` indicates failure.
	 *
	 * @remarks
	 * - Ensure that `this.init(localStorage)` has been called before using this method.
	 * - Uses `JSONHelper.safeParse` to safely parse the stored value.
	 */
	public get<T>(key: string): IMethodResponse<T> {
		try {
			if (!this.ls) {
				return {
					cause: `Local Storage is not initialize, run this.init(localStorage) before`,
					success: false,
					message: GET_LOCAL_STORAGE_FAILED
				}
			}

			const value = this.ls?.getItem(key);

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
	 * Removes an item from local storage by the specified key.
	 *
	 * @param key - The key of the item to remove from local storage.
	 * @returns An object indicating the success or failure of the operation, including a message and optional data.
	 * If local storage is not initialized, returns a failure object with a cause.
	 */
	public remove(key: string) {
		if (!this.ls) {
			return {
				cause: `Local Storage is not initialize, run this.init(localStorage) before`,
				success: false,
				message: REMOVE_LOCAL_STORAGE_FAILED
			}
		}

		this.ls?.removeItem(key);

		return {
			success: true,
			message: REMOVE_LOCAL_STORAGE_SUCCESS,
			data: null
		};
	}
}