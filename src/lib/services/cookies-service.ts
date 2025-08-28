import type { Cookies } from "@sveltejs/kit";
import type { CookiesType, CookiesResponse } from "$lib/types/index.js";
import { JSONHelper } from "$lib/helpers/index.js";

/**
 * Service for managing browser cookies
 * Provides methods to set, get, and delete cookies with standardized responses
 */
export class CookiesService {
    /**
     * The SvelteKit cookies object
     */
    private cookies: Cookies;

    /**
     * Creates a new CookiesService instance
     * @param cookies - The SvelteKit cookies object
     */
    constructor(cookies: Cookies) {
        this.cookies = cookies;
    }

    /**
     * Sets a cookie with the provided data
     * @param data - The cookie data to set
     * @returns A standardized response indicating success/failure and the value set
     */
    public set(data: CookiesType): CookiesResponse<string> {
        try {
            this.cookies.set(data.name, data.value, {
                path: data.path,
                maxAge: data.noMaxAge ? undefined : data.maxAge ?? 60 * 60 * 24 * 30, // Default: 30 days
                secure: data.secure ?? true,
                sameSite: data.sameSite ?? 'lax'
            });

            return {
                success: true,
                data: data.value
            }
        } catch {
            return {
                success: false,
                data: ''
            };
        }
    }

    /**
     * Gets a cookie by name and attempts to parse its value as JSON
     * @param name - The name of the cookie to retrieve
     * @returns A standardized response with the parsed value or error indication
     */
    public get<T>(name: string): CookiesResponse<T | string> {
        try {
            const getValue = this.cookies.get(name);

            if (!getValue) {
                return {
                    success: false,
                    data: ''
                };
            }

            const parse = JSONHelper.safeParse<T>(getValue);
            if (!parse.success) {
                return {
                    success: false,
                    data: ''
                };
            }

            return {
                success: true,
                data: parse.data
            }
        } catch (error) {
            return {
                success: false,
                data: ''
            }
        }
    }

    /**
     * Deletes a cookie by name
     * @param name - The name of the cookie to delete
     * @param path - The path of the cookie (defaults to '/')
     * @returns A standardized response indicating success/failure
     */
    public delete(name: string, path: string = '/'): CookiesResponse<string> {
        try {
            this.cookies.delete(name, { path });
            return {
                success: true,
                data: name
            }
        } catch {
            return {
                success: false,
                data: ''
            }
        }
    }
}