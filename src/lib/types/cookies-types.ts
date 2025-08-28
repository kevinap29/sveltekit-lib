/**
 * Interface representing the standard response format for cookie operations
 * @template T The type of data contained in the response
 */
export interface CookiesResponse<T> {
    /** Indicates whether the cookie operation was successful */
    success: boolean;
    /** Optional data returned from the cookie operation */
    data?: T;
}

/**
 * Type definition for cookie properties used throughout the application
 */
export type CookiesType = {
    /** The name of the cookie */
    name: string;
    /** The value to be stored in the cookie */
    value: string;
    /** The path on the server for which the cookie is valid */
    path: string;
    /** If true, the cookie will not have a max age set */
    noMaxAge?: boolean;
    /** The maximum age of the cookie in seconds */
    maxAge?: number;
    /** If true, the cookie will only be sent over HTTPS */
    secure?: boolean;
    /** Controls whether the cookie is sent with cross-site requests */
    sameSite?: 'lax' | 'strict' | 'none';
}