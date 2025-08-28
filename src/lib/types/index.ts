export * from './jwt-types.js';
export * from './hook-types.js';
export * from './html-types.js';
export * from './http-types.js';
export * from './cookies-types.js';

interface IMethodBase {
	success: boolean;
	message: string;
}

interface IMethodSuccess<T> extends IMethodBase {
	data: T;
	success: true;
}

interface IMethodError extends IMethodBase {
	cause: string;
	success: false;
}

/**
 * Represents the response of a method, which can be either a success or an error.
 *
 * @template T - The type of the successful response data.
 * @see IMethodSuccess
 * @see IMethodError
 */
export type IMethodResponse<T> = IMethodSuccess<T> | IMethodError;
