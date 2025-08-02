
/**
 * Sends an HTTP request using the Fetch API and returns the parsed JSON response as type `T`.
 * If the response is not OK, or if parsing fails, returns an error message as a string.
 *
 * @template T - The expected type of the parsed JSON response.
 * @param input - The resource that you wish to fetch; can be a URL or a RequestInfo object.
 * @param init - Optional configuration for the request, such as method, headers, body, etc.
 * @returns A promise that resolves to the parsed response of type `T`, or an error message string if the request fails or the response cannot be parsed.
 *
 * @example
 * interface User {
 *   id: number;
 *   name: string;
 * }
 * const user = await httpRequest<User>('https://api.example.com/user/1');
 * if (typeof user === 'string') {
 *   // Handle error
 *   console.error(user);
 * } else {
 *   // Use user data
 *   console.log(user.id, user.name);
 * }
 */
export async function httpRequest<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T | string> {
    try {
        const response = await fetch(input, init);
        
        if (!response.ok) 
            return `Failed to fetch with status ${response.status} and message ${response.statusText}`;

        const data = await response.json();

        if (typeof data !== 'object' || data === null) 
            return `Failed to parse response to the expected type`;

        return data as T;
    } catch (e) {
        const error = e as Error;

        return error.message;
    }
}