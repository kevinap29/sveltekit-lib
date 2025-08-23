/**
 * Represents the type signature of the global `fetch` function.
 * Useful for typing parameters or variables that expect a fetch-like function.
 */
export type FetchType = typeof fetch;
/**
 * Represents a standardized HTTP response structure.
 *
 * @template T The type of the response value.
 * @property {number} status - The HTTP status code of the response.
 * @property {boolean} success - Indicates whether the request was successful.
 * @property {string} message - A descriptive message about the response.
 * @property {T} value - The payload or data returned in the response.
 */
export interface HttpResponse<T> {
	status: number;
	success: boolean;
	message: string;
	value: T;
}
/**
 * Represents the structure of an HTTP request.
 *
 * @property fetch - The fetch function or object used to perform the request.
 * @property input - The resource that you wish to fetch; can be a URL object or a string.
 * @property init - Optional configuration for the request, such as method, headers, body, etc.
 */
export interface HttpRequestType {
	fetch: FetchType;
	input: RequestInfo | URL;
	init?: RequestInit;
}
